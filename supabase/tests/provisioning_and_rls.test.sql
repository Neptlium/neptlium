-- ---------------------------------------------------------------------------
-- Integration test fixtures: provisioning, RLS, and security invariants
--
-- STATUS: PREPARED — these tests are designed to run against a local
-- Supabase stack (supabase start) using the pgTAP extension. They are NOT
-- executed automatically in CI and have NOT been run against production.
-- To execute:
--   supabase db reset
--   supabase test db
--
-- Requires pgTAP: https://pgtap.org/
-- ---------------------------------------------------------------------------

begin;
select plan(17);

-- =========================================================================
-- Helper: create a test user (bypasses email confirmation)
-- =========================================================================
create or replace function test_helpers.make_user(p_email text)
returns uuid language plpgsql security definer as $$
declare v_uid uuid;
begin
  insert into auth.users (id, email, email_confirmed_at, created_at, updated_at)
  values (gen_random_uuid(), p_email, now(), now(), now())
  returning id into v_uid;

  -- Simulate the handle_new_user trigger (which inserts into profiles)
  perform public.handle_new_user();
  return v_uid;
end;
$$;

-- =========================================================================
-- 1. Trigger-based profile creation
-- =========================================================================

-- Test 1: handle_new_user trigger creates a profiles row on signup
select lives_ok(
  $$
    insert into auth.users (id, email, email_confirmed_at, created_at, updated_at)
    values ('11111111-0000-0000-0000-000000000001', 'trigger-test@example.com', now(), now(), now());
  $$,
  'handle_new_user trigger fires on auth.users insert without error'
);

select is(
  (select count(*)::int from public.profiles where id = '11111111-0000-0000-0000-000000000001'),
  1,
  'profiles row created by handle_new_user trigger'
);

-- =========================================================================
-- 2. Individual provisioning via provision_account()
-- =========================================================================

-- Set the JWT to test user 1
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-0000-0000-0000-000000000001","role":"authenticated"}';

-- Test 3: provision_account returns JSON with portfolio_id and wallet_id
select isnt(
  (select public.provision_account(
    'individual', 'Personal wealth', 'Alice', 'Smith', 'US', now(),
    'Long-term growth', 'experienced', 'USD', 'balanced',
    null, null, null, null, null, null, null
  )->>'portfolio_id'),
  null,
  'provision_account returns a portfolio_id'
);

-- Test 4: provisioned_at is set only after full success
select isnt(
  (select provisioned_at from public.profiles where id = '11111111-0000-0000-0000-000000000001'),
  null,
  'provisioned_at is set after successful provision_account'
);

-- Test 5: exactly one investment_portfolio exists for the user
select is(
  (select count(*)::int from public.investment_portfolios
   where profile_id = '11111111-0000-0000-0000-000000000001'),
  1,
  'exactly one investment_portfolio per provisioned profile'
);

-- Test 6: exactly one wallet exists for the user
select is(
  (select count(*)::int from public.wallets
   where profile_id = '11111111-0000-0000-0000-000000000001'),
  1,
  'exactly one wallet per provisioned profile'
);

-- Test 7: provision_account is idempotent (second call does not error or duplicate)
select lives_ok(
  $$
    perform public.provision_account(
      'individual', 'Personal wealth', 'Alice', 'Smith', 'US', now(),
      'Long-term growth', 'experienced', 'USD', 'balanced',
      null, null, null, null, null, null, null
    );
  $$,
  'provision_account is idempotent for the same user'
);

select is(
  (select count(*)::int from public.investment_portfolios
   where profile_id = '11111111-0000-0000-0000-000000000001'),
  1,
  'idempotent provision_account does not create duplicate portfolio'
);

select is(
  (select count(*)::int from public.wallets
   where profile_id = '11111111-0000-0000-0000-000000000001'),
  1,
  'idempotent provision_account does not create duplicate wallet'
);

-- =========================================================================
-- 3. Organization provisioning
-- =========================================================================

-- Insert test user 2
insert into auth.users (id, email, email_confirmed_at, created_at, updated_at)
values ('22222222-0000-0000-0000-000000000002', 'orgtest@example.com', now(), now(), now());

set local "request.jwt.claims" to '{"sub":"22222222-0000-0000-0000-000000000002","role":"authenticated"}';

select lives_ok(
  $$
    perform public.provision_account(
      'family_office', 'Multi-gen wealth', 'Bob', 'Jones', 'GB', now(),
      null, null, null, null,
      'Jones Family Office', 'Principal', null, 'Finance', 'GB', '1-10', null
    );
  $$,
  'provision_account succeeds for organization investor type'
);

select isnt(
  (select organization_id from public.profiles where id = '22222222-0000-0000-0000-000000000002'),
  null,
  'organization_id set on profile after org provisioning'
);

-- =========================================================================
-- 4. RLS: user cannot read another user's wallet
-- =========================================================================

-- Switch back to user 1; attempt to read user 2's wallet
set local "request.jwt.claims" to '{"sub":"11111111-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.wallets
   where profile_id = '22222222-0000-0000-0000-000000000002'),
  0,
  'user 1 cannot see user 2 wallet via RLS'
);

-- =========================================================================
-- 5. RLS: authenticated cannot insert directly into wallet_transactions
-- =========================================================================

-- The insert_own policy was dropped; direct INSERT must be rejected.
select throws_ok(
  $$
    insert into public.wallet_transactions
      (wallet_id, profile_id, type, asset, network, amount, status)
    values (
      (select id from public.wallets where profile_id = '11111111-0000-0000-0000-000000000001'),
      '11111111-0000-0000-0000-000000000001',
      'deposit', 'USD', 'WIRE', 9999, 'completed'
    );
  $$,
  null,
  null,
  'direct INSERT into wallet_transactions is blocked by RLS'
);

-- =========================================================================
-- 6. RLS: authenticated cannot insert directly into custody_addresses
-- =========================================================================

select throws_ok(
  $$
    insert into public.custody_addresses
      (wallet_id, profile_id, provider, asset, network, address)
    values (
      (select id from public.wallets where profile_id = '11111111-0000-0000-0000-000000000001'),
      '11111111-0000-0000-0000-000000000001',
      'internal', 'USD', 'WIRE', 'NLM-FAKE1234'
    );
  $$,
  null,
  null,
  'direct INSERT into custody_addresses is blocked by RLS'
);

-- =========================================================================
-- 7. Anonymous cannot execute privileged functions
-- =========================================================================

set local role anon;

select throws_ok(
  $$ select public.credit_balance(gen_random_uuid(), 'USD', 'WIRE', 9999, 'test', gen_random_uuid()); $$,
  null, null,
  'anon cannot execute credit_balance'
);

select throws_ok(
  $$ select public.confirm_crypto_deposit(gen_random_uuid(), 'USD', 'WIRE', 9999, 'hash'); $$,
  null, null,
  'anon cannot execute confirm_crypto_deposit'
);

select * from finish();
rollback;
