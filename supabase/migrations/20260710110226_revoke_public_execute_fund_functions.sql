-- These SECURITY DEFINER functions bypass RLS by design (they run as the
-- table owner). They must only be reachable from trusted server-side code
-- (service-role key), never directly from a browser using the public anon
-- key. Granting EXECUTE to anon/authenticated allowed anyone to mint
-- arbitrary account_balances, forge confirmed crypto deposits for any user,
-- finalize any payment_intent without payment, and overwrite pooled deposit
-- addresses.
revoke execute on function public.credit_balance(uuid, text, text, numeric, text, uuid) from anon, authenticated;
revoke execute on function public.confirm_crypto_deposit(uuid, text, text, numeric, text) from anon, authenticated;
revoke execute on function public.confirm_payment_intent(uuid) from anon, authenticated;
revoke execute on function public.admin_add_deposit_address(text, text, text, text, text, text) from anon, authenticated;
