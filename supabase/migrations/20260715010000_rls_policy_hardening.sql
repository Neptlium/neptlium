-- ---------------------------------------------------------------------------
-- RLS policy hardening: wallet ledger write isolation
--
-- Two issues addressed here:
--
-- 1. wallet_transactions_insert_own and custody_addresses_insert_own allow
--    any authenticated browser to POST arbitrary ledger rows directly
--    through PostgREST. For an institutional wallet ledger this is
--    unacceptable — inserts must be mediated by server-side logic that
--    validates wallet ownership and enforces business rules.
--    Drop these permissive INSERT policies and replace them with two
--    SECURITY DEFINER RPC functions that are only callable by authenticated
--    users and that enforce ownership before inserting.
--
-- 2. Grant the new RPC functions to authenticated only (not anon, not PUBLIC).
--
-- NOTE: organizations_insert_own is intentionally NOT added here. Organization
-- rows are created exclusively through provision_account() (SECURITY DEFINER),
-- which handles INSERT server-side. Granting browser INSERT permission on
-- organizations is unnecessary and increases the attack surface.
-- ---------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 1. Drop unsafe direct-insert policies on the wallet ledger tables
-- -------------------------------------------------------------------------

drop policy if exists "wallet_transactions_insert_own" on "public"."wallet_transactions";
drop policy if exists "custody_addresses_insert_own" on "public"."custody_addresses";


-- -------------------------------------------------------------------------
-- 2a. provision_deposit_address_for_wallet — server-validated deposit ref
--
-- Intended caller: authenticated (signed-in user only).
-- ACL: REVOKE ALL FROM PUBLIC; REVOKE FROM anon; GRANT TO authenticated.
--
-- Generates an internal funding reference (NLM-XXXXXXXX) for the specified
-- wallet after verifying the caller owns that wallet. Returns the new
-- custody_addresses row as JSON so the TypeScript caller can reconstruct a
-- CustodyAddress without a second SELECT.
--
-- Called by InternalLedgerCustodyProvider.provisionDepositAddress via
-- supabase.rpc('provision_deposit_address_for_wallet', ...).
-- -------------------------------------------------------------------------

create or replace function public.provision_deposit_address_for_wallet(
  p_wallet_id uuid,
  p_asset      text,
  p_network    text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_caller     uuid := auth.uid();
  v_profile_id uuid;
  v_reference  text;
  v_new_id     uuid;
  v_created_at timestamptz;
begin
  -- Require an authenticated session.
  if v_caller is null then
    raise exception 'authentication required' using errcode = 'P0001';
  end if;

  -- Validate non-empty inputs.
  if p_wallet_id is null then
    raise exception 'wallet_id is required' using errcode = 'P0005';
  end if;

  if p_asset is null or trim(p_asset) = '' then
    raise exception 'asset is required' using errcode = 'P0005';
  end if;

  if p_network is null or trim(p_network) = '' then
    raise exception 'network is required' using errcode = 'P0005';
  end if;

  -- Verify the wallet exists and belongs to the caller.
  select profile_id into v_profile_id
    from public.wallets
   where id = p_wallet_id;

  if not found then
    raise exception 'wallet not found' using errcode = 'P0002';
  end if;

  if v_profile_id <> v_caller then
    raise exception 'access denied' using errcode = 'P0003';
  end if;

  -- Generate reference in the same format as the TypeScript provider
  -- (NLM- followed by 8 uppercase hex characters).
  v_reference := 'NLM-' || upper(substr(gen_random_uuid()::text, 1, 8));
  v_created_at := now();

  insert into public.custody_addresses
    (wallet_id, profile_id, provider, asset, network, address, created_at)
  values
    (p_wallet_id, v_caller, 'internal', p_asset, p_network, v_reference, v_created_at)
  returning id into v_new_id;

  return jsonb_build_object(
    'id',         v_new_id,
    'asset',      p_asset,
    'network',    p_network,
    'address',    v_reference,
    'status',     'active',
    'created_at', v_created_at
  );
end;
$$;

-- Intended caller: authenticated (signed-in user only).
-- Historical default-privilege grants may exist; revoke explicitly.
revoke all     on function public.provision_deposit_address_for_wallet(uuid, text, text) from public;
revoke execute on function public.provision_deposit_address_for_wallet(uuid, text, text) from anon;
grant  execute on function public.provision_deposit_address_for_wallet(uuid, text, text) to authenticated;


-- -------------------------------------------------------------------------
-- 2b. request_wallet_withdrawal — server-validated withdrawal entry
--
-- Intended caller: authenticated (signed-in user only).
-- ACL: REVOKE ALL FROM PUBLIC; REVOKE FROM anon; GRANT TO authenticated.
--
-- Balance model: withdrawal is recorded as a PENDING transaction requiring
-- operations approval before funds are released. The database does NOT
-- atomically check the available balance because the current wallet_transactions
-- ledger has no balance column and deriving an available balance across
-- concurrent writes would require advisory locking beyond this function's
-- scope. Withdrawals are therefore non-binding requests; operations staff
-- must verify available balance before approving. DO NOT rely on this function
-- alone to prevent over-withdrawal — that enforcement happens in the operations
-- reconciliation step.
--
-- The database independently enforces:
--   - authenticated caller
--   - wallet ownership (caller must own the wallet)
--   - amount > 0 and non-null
--   - non-empty asset, network, destination
--
-- Called by InternalLedgerCustodyProvider.requestWithdrawal via
-- supabase.rpc('request_wallet_withdrawal', ...).
-- -------------------------------------------------------------------------

create or replace function public.request_wallet_withdrawal(
  p_wallet_id   uuid,
  p_asset       text,
  p_network     text,
  p_amount      numeric,
  p_destination text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_caller     uuid := auth.uid();
  v_profile_id uuid;
  v_new_id     uuid;
  v_created_at timestamptz;
begin
  -- Require an authenticated session.
  if v_caller is null then
    raise exception 'authentication required' using errcode = 'P0001';
  end if;

  -- Validate required inputs independently of any browser/TypeScript checks.
  if p_wallet_id is null then
    raise exception 'wallet_id is required' using errcode = 'P0005';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be greater than zero (got %)', coalesce(p_amount::text, 'null')
      using errcode = 'P0005';
  end if;

  if p_asset is null or trim(p_asset) = '' then
    raise exception 'asset is required' using errcode = 'P0005';
  end if;

  if p_network is null or trim(p_network) = '' then
    raise exception 'network is required' using errcode = 'P0005';
  end if;

  if p_destination is null or trim(p_destination) = '' then
    raise exception 'destination is required' using errcode = 'P0005';
  end if;

  -- Verify the wallet exists and belongs to the caller.
  select profile_id into v_profile_id
    from public.wallets
   where id = p_wallet_id;

  if not found then
    raise exception 'wallet not found' using errcode = 'P0002';
  end if;

  if v_profile_id <> v_caller then
    raise exception 'access denied' using errcode = 'P0003';
  end if;

  v_created_at := now();

  insert into public.wallet_transactions
    (wallet_id, profile_id, type, asset, network, amount, status, counterparty, created_at)
  values
    (p_wallet_id, v_caller, 'withdrawal', p_asset, p_network, p_amount, 'pending', p_destination, v_created_at)
  returning id into v_new_id;

  return jsonb_build_object(
    'id',          v_new_id,
    'type',        'withdrawal',
    'asset',       p_asset,
    'network',     p_network,
    'amount',      p_amount,
    'status',      'pending',
    'reference',   null,
    'counterparty', p_destination,
    'created_at',  v_created_at
  );
end;
$$;

-- Intended caller: authenticated (signed-in user only).
-- Historical default-privilege grants may exist; revoke explicitly.
revoke all     on function public.request_wallet_withdrawal(uuid, text, text, numeric, text) from public;
revoke execute on function public.request_wallet_withdrawal(uuid, text, text, numeric, text) from anon;
grant  execute on function public.request_wallet_withdrawal(uuid, text, text, numeric, text) to authenticated;
