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
--
-- Test count breakdown:
--   Tests  1-2  : handle_new_user trigger
--   Tests  3-9  : individual account provisioning (idempotency)
--   Tests 10-11 : organization provisioning
--   Tests 12    : RLS — cross-user wallet read blocked
--   Tests 13    : RLS — direct INSERT into wallet_transactions blocked
--   Tests 14    : RLS — direct INSERT into custody_addresses blocked
--   Tests 15-16 : privilege — anon cannot call privileged functions
--   Tests 17-19 : ON CONFLICT target — user_roles uses (user_id, role)
--   Tests 20-23 : withdrawal validation — zero, negative, blank fields
--   Tests 24-25 : withdrawal authorization — wrong wallet, cross-user
--   Tests 26-28 : provision_account input validation
-- ---------------------------------------------------------------------------

begin;
select plan(28);

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

-- =========================================================================
-- 8. ON CONFLICT target correctness: user_roles uses (user_id, role)
--
-- Rationale: user_roles has UNIQUE (user_id, role), NOT UNIQUE (user_id).
-- A second insert with the same (user_id, role) must silently succeed;
-- an insert with the same user_id but a different role must create a row.
-- If ON CONFLICT (user_id) were used PostgreSQL would raise
-- "there is no unique or exclusion constraint matching the ON CONFLICT
-- specification". This block verifies the correct composite target is used.
-- =========================================================================

set local role authenticated;
set local "request.jwt.claims" to '{"sub":"11111111-0000-0000-0000-000000000001","role":"authenticated"}';

-- Test 17: inserting the same (user_id, role) again does nothing (idempotent)
select lives_ok(
  $$
    insert into public.user_roles (user_id, role)
    values ('11111111-0000-0000-0000-000000000001', 'user')
    on conflict (user_id, role) do nothing;
  $$,
  'ON CONFLICT (user_id, role) DO NOTHING is accepted by the constraint'
);

select is(
  (select count(*)::int from public.user_roles
   where user_id = '11111111-0000-0000-0000-000000000001' and role = 'user'),
  1,
  'no duplicate user_role row after idempotent insert'
);

-- Test 19: inserting (user_id, different_role) creates a second row
select lives_ok(
  $$
    insert into public.user_roles (user_id, role)
    values ('11111111-0000-0000-0000-000000000001', 'admin')
    on conflict (user_id, role) do nothing;
  $$,
  'different role for same user_id inserts successfully'
);

-- =========================================================================
-- 9. request_wallet_withdrawal: input validation
-- =========================================================================

set local "request.jwt.claims" to '{"sub":"11111111-0000-0000-0000-000000000001","role":"authenticated"}';

-- Test 20: zero amount must be rejected
select throws_ok(
  $$
    select public.request_wallet_withdrawal(
      (select id from public.wallets where profile_id = '11111111-0000-0000-0000-000000000001'),
      'USD', 'WIRE', 0, 'DEST-ACCOUNT'
    );
  $$,
  'P0005', null,
  'request_wallet_withdrawal rejects zero amount'
);

-- Test 21: negative amount must be rejected
select throws_ok(
  $$
    select public.request_wallet_withdrawal(
      (select id from public.wallets where profile_id = '11111111-0000-0000-0000-000000000001'),
      'USD', 'WIRE', -100, 'DEST-ACCOUNT'
    );
  $$,
  'P0005', null,
  'request_wallet_withdrawal rejects negative amount'
);

-- Test 22: blank asset must be rejected
select throws_ok(
  $$
    select public.request_wallet_withdrawal(
      (select id from public.wallets where profile_id = '11111111-0000-0000-0000-000000000001'),
      '   ', 'WIRE', 100, 'DEST-ACCOUNT'
    );
  $$,
  'P0005', null,
  'request_wallet_withdrawal rejects blank asset'
);

-- Test 23: blank destination must be rejected
select throws_ok(
  $$
    select public.request_wallet_withdrawal(
      (select id from public.wallets where profile_id = '11111111-0000-0000-0000-000000000001'),
      'USD', 'WIRE', 100, '   '
    );
  $$,
  'P0005', null,
  'request_wallet_withdrawal rejects blank destination'
);

-- =========================================================================
-- 10. request_wallet_withdrawal: authorization
-- =========================================================================

-- Test 24: non-existent wallet is rejected
select throws_ok(
  $$
    select public.request_wallet_withdrawal(
      gen_random_uuid(),
      'USD', 'WIRE', 100, 'DEST-ACCOUNT'
    );
  $$,
  'P0002', null,
  'request_wallet_withdrawal rejects unknown wallet_id'
);

-- Test 25: user 1 cannot withdraw from user 2's wallet (cross-user)
select throws_ok(
  $$
    select public.request_wallet_withdrawal(
      (select id from public.wallets where profile_id = '22222222-0000-0000-0000-000000000002'),
      'USD', 'WIRE', 100, 'DEST-ACCOUNT'
    );
  $$,
  'P0003', null,
  'request_wallet_withdrawal denies access to another user wallet'
);

-- =========================================================================
-- 11. provision_account: input validation
-- =========================================================================

-- Insert test user 3 (validation tests, never fully provisioned)
insert into auth.users (id, email, email_confirmed_at, created_at, updated_at)
values ('33333333-0000-0000-0000-000000000003', 'validate@example.com', now(), now(), now());

set local "request.jwt.claims" to '{"sub":"33333333-0000-0000-0000-000000000003","role":"authenticated"}';

-- Test 26: invalid investor_type is rejected
select throws_ok(
  $$
    select public.provision_account(
      'hacker', 'Bad type', 'Eve', 'Mal', 'US', now(),
      null, null, null, null,
      null, null, null, null, null, null, null
    );
  $$,
  'P0005', null,
  'provision_account rejects unknown investor_type'
);

-- Test 27: blank first_name is rejected
select throws_ok(
  $$
    select public.provision_account(
      'individual', 'Personal wealth', '   ', 'Smith', 'US', now(),
      'Growth', 'experienced', 'USD', 'balanced',
      null, null, null, null, null, null, null
    );
  $$,
  'P0005', null,
  'provision_account rejects blank first_name'
);

-- Test 28: non-individual type without org_name is rejected
select throws_ok(
  $$
    select public.provision_account(
      'family_office', 'Multi-gen wealth', 'Bob', 'Jones', 'GB', now(),
      null, null, null, null,
      null, null, null, null, null, null, null
    );
  $$,
  'P0005', null,
  'provision_account rejects non-individual type without org_name'
);

select * from finish();
rollback;
