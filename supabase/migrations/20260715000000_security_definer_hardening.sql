-- ---------------------------------------------------------------------------
-- SECURITY DEFINER hardening pass
--
-- Context from live audit:
-- The remote_schema migration (20260710104755) granted EXECUTE on ALL
-- SECURITY DEFINER functions to anon, authenticated, and service_role.
-- Migration 20260710110226 revoked anon/authenticated from the four
-- most critical fund-mutation functions (credit_balance,
-- confirm_crypto_deposit, confirm_payment_intent,
-- admin_add_deposit_address) but left several others still callable via
-- RPC by any signed-in or anonymous browser client.
--
-- Additionally, multiple SECURITY DEFINER functions lack a fixed
-- search_path, which allows a privileged search_path injection if a
-- schema object is substituted at call time.
--
-- Trigger functions (handle_new_user, handle_new_portfolio) are only
-- invoked by the trigger infrastructure — granting EXECUTE to
-- anon/authenticated serves no purpose and opens a direct-call attack
-- surface.
--
-- rls_auto_enable is an EVENT TRIGGER function. Event triggers are fired
-- by DDL, not by explicit CALL/SELECT. Granting EXECUTE to end-user
-- roles is meaningless and confusing.
--
-- is_admin leaks membership data (any caller can enumerate admin status
-- for any UUID); create_withdrawal_request exposes legacy account_balance
-- mutation to any authenticated session.
--
-- This migration is additive/subtractive on permissions only — no tables,
-- columns, or data are changed.
-- ---------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 1. Revoke from PUBLIC (default implicit grant on new functions in PG).
--    These are all SECURITY DEFINER and must never be exposed via RPC to
--    untrusted callers.
-- -------------------------------------------------------------------------

revoke execute on function public.admin_add_deposit_address(text, text, text, text, text, text)
  from public;

revoke execute on function public.confirm_crypto_deposit(uuid, text, text, numeric, text)
  from public;

revoke execute on function public.confirm_payment_intent(uuid)
  from public;

revoke execute on function public.credit_balance(uuid, text, text, numeric, text, uuid)
  from public;

revoke execute on function public.create_withdrawal_request(text, text, numeric, text)
  from public;

revoke execute on function public.handle_new_user()
  from public;

revoke execute on function public.handle_new_portfolio()
  from public;

revoke execute on function public.is_admin(uuid)
  from public;

-- rls_auto_enable is an event trigger function; anon/authenticated cannot
-- invoke event triggers, but revoke anyway to be explicit.
revoke execute on function public.rls_auto_enable()
  from public;


-- -------------------------------------------------------------------------
-- 2. Revoke from anon / authenticated where not already done.
--    (credit_balance, confirm_crypto_deposit, confirm_payment_intent,
--    admin_add_deposit_address were covered by 20260710110226; the
--    remaining ones are completed here.)
-- -------------------------------------------------------------------------

revoke execute on function public.create_withdrawal_request(text, text, numeric, text)
  from anon, authenticated;

revoke execute on function public.handle_new_user()
  from anon, authenticated;

revoke execute on function public.handle_new_portfolio()
  from anon, authenticated;

revoke execute on function public.is_admin(uuid)
  from anon, authenticated;

revoke execute on function public.rls_auto_enable()
  from anon, authenticated;


-- -------------------------------------------------------------------------
-- 3. Fix mutable search_path on functions that are missing SET search_path.
--
--    Without a fixed search_path, a SECURITY DEFINER function runs with the
--    caller's search_path, which can be manipulated to shadow pg_catalog or
--    public objects, leading to privilege-escalation or data-spoofing.
--    ALTER FUNCTION … SET search_path = 'public' pins it without changing
--    function logic.
-- -------------------------------------------------------------------------

alter function public.confirm_crypto_deposit(uuid, text, text, numeric, text)
  set search_path = 'public';

alter function public.confirm_payment_intent(uuid)
  set search_path = 'public';

alter function public.credit_balance(uuid, text, text, numeric, text, uuid)
  set search_path = 'public';

alter function public.create_withdrawal_request(text, text, numeric, text)
  set search_path = 'public';

alter function public.is_admin(uuid)
  set search_path = 'public';


-- -------------------------------------------------------------------------
-- 4. Fix security-definer views.
--
--    public.signals and public.allocations are owned by postgres and
--    therefore run with the owner's privileges, bypassing RLS on their
--    underlying tables. Setting security_invoker = true makes them execute
--    with the querying role's credentials so that row-level security on
--    market_signals, whale_signals, and strategy_allocations is respected.
--
--    Note: security_invoker on views requires PostgreSQL ≥ 15 (available
--    on all current Supabase projects).
-- -------------------------------------------------------------------------

alter view public.signals set (security_invoker = true);

alter view public.allocations set (security_invoker = true);
