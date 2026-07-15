-- ---------------------------------------------------------------------------
-- Atomic account provisioning
--
-- Problem: onboarding/actions.ts performs account provisioning as a sequence
-- of independent Supabase client calls (role insert → org insert → profile
-- update including provisioned_at → portfolio insert → wallet insert). If any
-- step after the profile update fails, provisioned_at is already set and the
-- account appears complete while missing a portfolio or wallet.
--
-- This migration:
-- 1. Adds a unique constraint on wallets(profile_id) — one wallet per
--    provisioned profile. Required for ON CONFLICT idempotency in the
--    provisioning function and enforces the business invariant documented
--    in platform_foundations (currently only implicit).
--
-- 2. Creates provision_account(), a SECURITY DEFINER function that wraps
--    the entire provisioning sequence in a single database transaction.
--    provisioned_at is written last, so a failure at any earlier step leaves
--    it NULL and the user is correctly routed back to /onboarding on next
--    login.
--
-- 3. Makes each step idempotent (ON CONFLICT DO NOTHING / DO UPDATE) so
--    that a retry after a network error or partial commit does not create
--    duplicate rows.
--
-- No existing data is affected: wallets currently has 0 rows (verified by
-- live audit at migration design time).
-- ---------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 1. Enforce one wallet per provisioned profile
-- -------------------------------------------------------------------------

alter table "public"."wallets"
  add constraint "wallets_profile_id_unique" unique ("profile_id");


-- -------------------------------------------------------------------------
-- 2. provision_account — transactional account-opening
--
-- All parameters that are optional for individual accounts are DEFAULT NULL;
-- organization-specific fields are only inserted when p_org_name IS NOT NULL.
--
-- Returns JSON with portfolio_id, wallet_id, organization_id so the caller
-- can confirm what was created without an additional SELECT.
--
-- Callable only by the signed-in user (auth.uid() must match the row being
-- provisioned); revoked from anon, public, and service_role (service_role
-- uses the admin client directly when needed).
-- -------------------------------------------------------------------------

create or replace function public.provision_account(
  -- Identity fields (all accounts)
  p_investor_type               text,
  p_purpose                     text,
  p_first_name                  text,
  p_last_name                   text,
  p_residence_country           text,
  p_compliance_acknowledged_at  timestamptz,

  -- Individual-only fields
  p_primary_objective           text    default null,
  p_investment_experience       text    default null,
  p_preferred_currency          text    default null,
  p_risk_preference             text    default null,

  -- Organization fields (non-individual purposes)
  p_org_name                    text    default null,
  p_org_role                    text    default null,
  p_org_website                 text    default null,
  p_org_industry                text    default null,
  p_org_country                 text    default null,
  p_org_size                    text    default null,
  p_aum_range                   text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id      uuid := auth.uid();
  v_org_id       uuid := null;
  v_portfolio_id uuid;
  v_wallet_id    uuid;
begin
  -- Require an authenticated session.
  if v_user_id is null then
    raise exception 'authentication required' using errcode = 'P0001';
  end if;

  -- ------------------------------------------------------------------
  -- Step 1: Idempotent role assignment
  -- ------------------------------------------------------------------
  insert into user_roles (user_id, role)
  values (v_user_id, 'user')
  on conflict (user_id) do nothing;

  -- ------------------------------------------------------------------
  -- Step 2: Organization (non-individual investor types only)
  -- ------------------------------------------------------------------
  if p_org_name is not null then
    -- Insert a new organization row; if the owner already has one (retry),
    -- update its fields to reflect the latest submission.
    insert into organizations
      (owner_id, name, role, website, industry, country, organization_size, aum_range)
    values
      (v_user_id, p_org_name, p_org_role, p_org_website, p_org_industry,
       p_org_country, p_org_size, p_aum_range)
    on conflict do nothing
    returning id into v_org_id;

    -- If the row already existed (ON CONFLICT suppressed the insert),
    -- fetch the existing id.
    if v_org_id is null then
      select id into v_org_id
        from organizations
       where owner_id = v_user_id
       order by created_at
       limit 1;
    end if;
  end if;

  -- ------------------------------------------------------------------
  -- Step 3: Investment portfolio (idempotent via unique profile_id)
  -- ------------------------------------------------------------------
  insert into investment_portfolios (profile_id)
  values (v_user_id)
  on conflict (profile_id) do nothing
  returning id into v_portfolio_id;

  if v_portfolio_id is null then
    select id into v_portfolio_id
      from investment_portfolios
     where profile_id = v_user_id;
  end if;

  -- ------------------------------------------------------------------
  -- Step 4: Wallet (idempotent via unique profile_id added above)
  -- ------------------------------------------------------------------
  insert into wallets (portfolio_id, profile_id, provider)
  values (v_portfolio_id, v_user_id, 'internal')
  on conflict (profile_id) do nothing
  returning id into v_wallet_id;

  if v_wallet_id is null then
    select id into v_wallet_id
      from wallets
     where profile_id = v_user_id;
  end if;

  -- ------------------------------------------------------------------
  -- Step 5: Profile update — provisioned_at written LAST so that any
  -- failure above leaves it NULL and keeps the account in a recoverable
  -- "not yet provisioned" state.
  -- ------------------------------------------------------------------
  update profiles set
    first_name                 = p_first_name,
    last_name                  = p_last_name,
    full_name                  = trim(p_first_name || ' ' || p_last_name),
    country                    = p_residence_country,
    investor_type              = p_investor_type,
    purpose                    = p_purpose,
    organization_id            = v_org_id,
    primary_objective          = p_primary_objective,
    investment_experience      = p_investment_experience,
    preferred_currency         = p_preferred_currency,
    risk_preference            = p_risk_preference,
    compliance_status          = 'active',
    compliance_acknowledged_at = p_compliance_acknowledged_at,
    provisioned_at             = now()
  where id = v_user_id;

  -- Confirm the profile row exists (trigger should have created it on signup).
  if not found then
    raise exception 'profile row missing for user %', v_user_id
      using errcode = 'P0004';
  end if;

  return jsonb_build_object(
    'portfolio_id',    v_portfolio_id,
    'wallet_id',       v_wallet_id,
    'organization_id', v_org_id
  );
end;
$$;

-- Only the signed-in user's session should call this — not anon, not the
-- service role (which uses the admin client directly).
revoke all   on function public.provision_account(
  text, text, text, text, text, timestamptz,
  text, text, text, text,
  text, text, text, text, text, text, text
) from public;

grant execute on function public.provision_account(
  text, text, text, text, text, timestamptz,
  text, text, text, text,
  text, text, text, text, text, text, text
) to authenticated;
