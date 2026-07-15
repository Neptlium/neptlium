-- ---------------------------------------------------------------------------
-- Platform query indexes
--
-- Idempotent (CREATE INDEX IF NOT EXISTS). All names follow the convention
-- idx_<table>_<columns>. Indexes already implied by UNIQUE constraints (which
-- create an index automatically) are NOT repeated here.
--
-- Skipped as already covered by UNIQUE constraints:
--   - wallets(profile_id)      covered by wallets_profile_id_unique
--   - wallets(portfolio_id)    covered by wallets_portfolio_id_unique
--   - investment_portfolios(profile_id)  covered by the UNIQUE NOT NULL in the table DDL
--
-- CONCURRENTLY cannot be used inside a transaction, so indexes are created
-- outside one. Supabase migrations run as single-statement DDL here; add
-- CONCURRENTLY if running against a live production database with high write
-- volume. For an initial migration on empty tables CONCURRENTLY is unnecessary.
-- ---------------------------------------------------------------------------

-- organizations(owner_id) — look up organization by owning user
create index if not exists idx_organizations_owner_id
  on public.organizations (owner_id);

-- profiles(organization_id) — look up profiles belonging to an organization
create index if not exists idx_profiles_organization_id
  on public.profiles (organization_id);

-- wallet_transactions(wallet_id, created_at DESC) — ledger read for a wallet
create index if not exists idx_wallet_transactions_wallet_created
  on public.wallet_transactions (wallet_id, created_at desc);

-- wallet_transactions(profile_id, created_at DESC) — ledger read by profile
create index if not exists idx_wallet_transactions_profile_created
  on public.wallet_transactions (profile_id, created_at desc);

-- custody_addresses(wallet_id) — deposit-address lookup by wallet
create index if not exists idx_custody_addresses_wallet_id
  on public.custody_addresses (wallet_id);

-- custody_addresses(profile_id) — deposit-address lookup by profile
create index if not exists idx_custody_addresses_profile_id
  on public.custody_addresses (profile_id);

-- documents(profile_id, created_at DESC) — document list for a user
create index if not exists idx_documents_profile_created
  on public.documents (profile_id, created_at desc);

-- login_history(user_id, created_at DESC) — recent security events for a user
create index if not exists idx_login_history_user_created
  on public.login_history (user_id, created_at desc);

-- notifications(user_id, created_at DESC) — notification feed for a user
create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

-- trusted_devices(user_id, last_seen_at DESC) — active devices for a user
create index if not exists idx_trusted_devices_user_last_seen
  on public.trusted_devices (user_id, last_seen_at desc);
