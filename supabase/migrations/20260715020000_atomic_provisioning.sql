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
-- 1. Adds a unique constraint on organizations(owner_id) — the provisioning
--    model creates exactly one organization per user. This enforces the
--    business invariant and provides the ON CONFLICT target required by the
--    provision_account function below.
--
-- 2. Adds a unique constraint on wallets(profile_id) — one primary wallet per
--    provisioned profile. Required for ON CONFLICT idempotency in the
--    provisioning function and enforces the business invariant documented
--    in platform_foundations (currently only implicit).
--
-- 3. Adds a unique constraint on wallets(portfolio_id) — one wallet per
--    investment portfolio, matching the product model (one primary portfolio
--    per profile, one wallet per portfolio).
--
-- 4. Creates provision_account(), a SECURITY DEFINER function that wraps
--    the entire provisioning sequence in a single database transaction.
--    provisioned_at is written last, so a failure at any earlier step leaves
--    it NULL and the user is correctly routed back to /onboarding on next
--    login.
--
-- 5. Makes each step idempotent (ON CONFLICT with explicit targets) so
--    that a retry after a network error or partial commit does not create
--    duplicate rows.
--
-- 6. Enforces all required inputs server-side. Do not rely on Zod alone
--    because the RPC is directly callable by any authenticated client.
--
-- 7. Uses pg_advisory_xact_lock to prevent duplicate provisioning from
--    concurrent requests (e.g. double-click or parallel tab submissions).
--
-- No existing data is affected: wallets and organizations currently have 0
-- rows (verified by live audit at migration design time).
-- ---------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 1. Enforce one organization per owner
-- -------------------------------------------------------------------------

alter table "public"."organizations"
  add constraint "organizations_owner_id_unique" unique ("owner_id");


-- -------------------------------------------------------------------------
-- 2. Enforce one wallet per provisioned profile
-- -------------------------------------------------------------------------

alter table "public"."wallets"
  add constraint "wallets_profile_id_unique" unique ("profile_id");


-- -------------------------------------------------------------------------
-- 3. Enforce one wallet per investment portfolio
-- -------------------------------------------------------------------------

alter table "public"."wallets"
  add constraint "wallets_portfolio_id_unique" unique ("portfolio_id");


-- -------------------------------------------------------------------------
-- 4. provision_account — transactional account-opening
--
-- Intended caller: authenticated (signed-in user only).
-- ACL: REVOKE ALL FROM PUBLIC; REVOKE FROM anon; GRANT TO authenticated.
--
-- All parameters that are optional for individual accounts are DEFAULT NULL;
-- organization-specific fields are only inserted when p_org_name IS NOT NULL.
--
-- Returns JSON with portfolio_id, wallet_id, organization_id so the caller
-- can confirm what was created without an additional SELECT.
--
-- Routing guard: app/lib/auth/guards.ts checks profile.provisioned_at to
-- gate dashboard access. provisioned_at is written last so a partial failure
-- always leaves the account in a retryable "not yet provisioned" state.
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
set search_path = pg_catalog, public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_org_id       uuid := null;
  v_portfolio_id uuid;
  v_wallet_id    uuid;
begin
  -- ------------------------------------------------------------------
  -- Require an authenticated session.
  -- ------------------------------------------------------------------
  if v_user_id is null then
    raise exception 'authentication required' using errcode = 'P0001';
  end if;

  -- ------------------------------------------------------------------
  -- Validate required inputs. Do not trust browser/Zod validation alone
  -- because this RPC is directly callable by any authenticated client.
  -- ------------------------------------------------------------------

  -- Investor type must be one of the six supported values.
  if p_investor_type is null or p_investor_type not in (
    'individual', 'family_office', 'business',
    'investment_firm', 'treasury_team', 'capital_partner'
  ) then
    raise exception 'invalid investor_type: %', p_investor_type
      using errcode = 'P0005';
  end if;

  if p_first_name is null or trim(p_first_name) = '' then
    raise exception 'first_name is required' using errcode = 'P0005';
  end if;

  if p_last_name is null or trim(p_last_name) = '' then
    raise exception 'last_name is required' using errcode = 'P0005';
  end if;

  if p_residence_country is null or trim(p_residence_country) = '' then
    raise exception 'residence_country is required' using errcode = 'P0005';
  end if;

  if p_purpose is null or trim(p_purpose) = '' then
    raise exception 'purpose is required' using errcode = 'P0005';
  end if;

  if p_compliance_acknowledged_at is null then
    raise exception 'compliance_acknowledged_at is required' using errcode = 'P0005';
  end if;

  -- Organization accounts require an org name.
  if p_investor_type <> 'individual' and (p_org_name is null or trim(p_org_name) = '') then
    raise exception 'org_name is required for non-individual investor types'
      using errcode = 'P0005';
  end if;

  -- Individual accounts must not receive an org name to avoid inconsistent
  -- state (profile.organization_id would remain NULL while an orphaned org
  -- row exists with owner_id = user).
  if p_investor_type = 'individual' and p_org_name is not null and trim(p_org_name) <> '' then
    raise exception 'org_name must be null for individual investor type'
      using errcode = 'P0005';
  end if;

  -- ------------------------------------------------------------------
  -- Acquire a per-user advisory lock so that concurrent provisioning
  -- calls for the same user_id (e.g. double-submit, parallel tabs)
  -- queue rather than race. The lock is released automatically when
  -- the transaction commits or rolls back.
  -- ------------------------------------------------------------------
  perform pg_advisory_xact_lock(('x' || substr(md5(v_user_id::text), 1, 15))::bit(60)::bigint);

  -- ------------------------------------------------------------------
  -- Step 1: Idempotent role assignment.
  -- user_roles has UNIQUE (user_id, role); use that composite target.
  -- ------------------------------------------------------------------
  insert into public.user_roles (user_id, role)
  values (v_user_id, 'user')
  on conflict (user_id, role) do nothing;

  -- ------------------------------------------------------------------
  -- Step 2: Organization (non-individual investor types only).
  -- ON CONFLICT (owner_id) DO UPDATE re-applies the submitted fields on
  -- retry so a re-submitted form always reflects the latest data.
  -- ------------------------------------------------------------------
  if p_org_name is not null and trim(p_org_name) <> '' then
    insert into public.organizations
      (owner_id, name, role, website, industry, country, organization_size, aum_range)
    values
      (v_user_id, p_org_name, p_org_role, p_org_website, p_org_industry,
       p_org_country, p_org_size, p_aum_range)
    on conflict (owner_id) do update set
      name              = excluded.name,
      role              = excluded.role,
      website           = excluded.website,
      industry          = excluded.industry,
      country           = excluded.country,
      organization_size = excluded.organization_size,
      aum_range         = excluded.aum_range
    returning id into v_org_id;
  end if;

  -- ------------------------------------------------------------------
  -- Step 3: Investment portfolio (idempotent via unique profile_id).
  -- ------------------------------------------------------------------
  insert into public.investment_portfolios (profile_id)
  values (v_user_id)
  on conflict (profile_id) do nothing
  returning id into v_portfolio_id;

  if v_portfolio_id is null then
    select id into v_portfolio_id
      from public.investment_portfolios
     where profile_id = v_user_id;
  end if;

  -- ------------------------------------------------------------------
  -- Step 4: Wallet (idempotent via unique profile_id added above).
  -- ------------------------------------------------------------------
  insert into public.wallets (portfolio_id, profile_id, provider)
  values (v_portfolio_id, v_user_id, 'internal')
  on conflict (profile_id) do nothing
  returning id into v_wallet_id;

  if v_wallet_id is null then
    select id into v_wallet_id
      from public.wallets
     where profile_id = v_user_id;
  end if;

  -- ------------------------------------------------------------------
  -- Step 5: Profile update — provisioned_at written LAST so that any
  -- failure above leaves it NULL and keeps the account in a recoverable
  -- "not yet provisioned" state.
  -- ------------------------------------------------------------------
  update public.profiles set
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

-- Intended caller: authenticated (signed-in user only).
-- Historical default-privilege grants from earlier migrations may have
-- granted EXECUTE to anon or authenticated; revoke explicitly to be safe.
revoke all     on function public.provision_account(
  text, text, text, text, text, timestamptz,
  text, text, text, text,
  text, text, text, text, text, text, text
) from public;

revoke execute on function public.provision_account(
  text, text, text, text, text, timestamptz,
  text, text, text, text,
  text, text, text, text, text, text, text
) from anon;

grant execute on function public.provision_account(
  text, text, text, text, text, timestamptz,
  text, text, text, text,
  text, text, text, text, text, text, text
) to authenticated;
