-- ---------------------------------------------------------------------------
-- RLS policy hardening: organizations INSERT, wallet ledger write isolation
--
-- Three issues addressed here:
--
-- 1. organizations has SELECT and UPDATE owner policies but no INSERT policy.
--    The onboarding provisioning path (actions.ts) inserts organization rows
--    using the user's session client; without an INSERT policy, RLS blocks
--    that insert and provisioning fails for every non-individual account
--    type. Add a minimal owner-checks INSERT policy.
--
-- 2. wallet_transactions_insert_own and custody_addresses_insert_own allow
--    any authenticated browser to POST arbitrary ledger rows directly
--    through PostgREST. For an institutional wallet ledger this is
--    unacceptable — inserts must be mediated by server-side logic that
--    validates wallet ownership and enforces business rules.
--    Drop these permissive INSERT policies and replace them with two
--    SECURITY DEFINER RPC functions that are only callable by authenticated
--    users and that enforce ownership before inserting.
--
-- 3. Grant the new RPC functions to authenticated only (not anon, not PUBLIC).
-- ---------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 1. organizations: authenticated owner INSERT policy
-- -------------------------------------------------------------------------

create policy "organizations_insert_own" on "public"."organizations"
  for insert with check (auth.uid() = owner_id);


-- -------------------------------------------------------------------------
-- 2. Drop unsafe direct-insert policies on the wallet ledger tables
-- -------------------------------------------------------------------------

drop policy if exists "wallet_transactions_insert_own" on "public"."wallet_transactions";
drop policy if exists "custody_addresses_insert_own" on "public"."custody_addresses";


-- -------------------------------------------------------------------------
-- 3a. provision_deposit_address_for_wallet — server-validated deposit ref
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
set search_path = 'public'
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

  -- Verify the wallet exists and belongs to the caller.
  select profile_id into v_profile_id
    from wallets
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

  insert into custody_addresses
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

-- Grant only to authenticated callers; no public/anon access.
revoke all   on function public.provision_deposit_address_for_wallet(uuid, text, text) from public;
grant  execute on function public.provision_deposit_address_for_wallet(uuid, text, text) to authenticated;


-- -------------------------------------------------------------------------
-- 3b. request_wallet_withdrawal — server-validated withdrawal entry
--
-- Inserts a pending withdrawal transaction for the specified wallet after
-- verifying the caller owns it. Returns the new wallet_transactions row as
-- JSON. The actual balance check and funds-reservation happen in the
-- TypeScript Server Action before this is called; this function enforces
-- only the ownership invariant so the DB can never receive a forged insert
-- even if the Server Action is bypassed.
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
set search_path = 'public'
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

  -- Verify the wallet exists and belongs to the caller.
  select profile_id into v_profile_id
    from wallets
   where id = p_wallet_id;

  if not found then
    raise exception 'wallet not found' using errcode = 'P0002';
  end if;

  if v_profile_id <> v_caller then
    raise exception 'access denied' using errcode = 'P0003';
  end if;

  v_created_at := now();

  insert into wallet_transactions
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

-- Grant only to authenticated callers; no public/anon access.
revoke all   on function public.request_wallet_withdrawal(uuid, text, text, numeric, text) from public;
grant  execute on function public.request_wallet_withdrawal(uuid, text, text, numeric, text) to authenticated;
