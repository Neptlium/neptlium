# Neptlium — Authentication Architecture

Supabase Auth is the single authentication and identity provider for Neptlium.
No Clerk, Auth0, or competing auth system is used.

---

## Client Architecture

Four separate Supabase clients serve distinct contexts.

### Browser Client (`@netlium/lib/supabase` → `src/supabase/browser.ts`)

Used in Client Components. Created with `@supabase/ssr`'s `createBrowserClient`.
Automatically reads and writes session cookies. Singleton re-exported from the
lib root.

### Server Client (`@netlium/lib/supabase/server`)

Used in Server Components, Route Handlers, and Server Actions. Created with
`createServerClient` per-request from the `next/headers` cookie store.
Can read cookies; session refresh cookies are written by the middleware.

### Middleware Client (`@netlium/lib/supabase/middleware`)

Used inside `apps/app/middleware.ts` via `updateSession(request)`. Intercepts
every request, calls `supabase.auth.getUser()` to refresh the access token when
expired, and propagates updated cookies to the response. **This is the mechanism
that keeps sessions alive beyond the one-hour access-token window.**

### Admin Client (`@netlium/lib/supabase/admin`)

Uses the `SUPABASE_SERVICE_ROLE_KEY`. Bypasses Row Level Security. Imported
only inside Server Actions and Route Handlers. Never imported from any client
bundle. Used for provisioning operations (org creation, portfolio setup, role
assignment) where the admin needs to write across multiple tables atomically.

---

## Session and Cookie Behavior

1. On sign-in or after email confirmation, Supabase sets a session cookie via
   the Server Client or Route Handler.
2. `apps/app/middleware.ts` runs on every request and refreshes the session if
   the access token is expired (using the refresh token stored in the cookie).
3. Server Components call `supabase.auth.getUser()` (never `getSession()` alone)
   to get the authoritative server-verified identity.
4. After sign-out, cookies are cleared and server routes reject stale sessions.

---

## Sign-Up Flow

Route: `/signup` (alias: `/sign-up`)

1. User fills in **first name**, **last name**, **email**, **password**,
   **confirm password**, and accepts the Terms of Service.
2. `SignupForm.tsx` (client component) validates locally and submits via
   `useActionState` to the `signup` server action.
3. `signup` action calls `supabase.auth.signUp()` with:
   - `email`, `password`
   - `options.data`: `{ first_name, last_name, full_name }` (stored in
     `auth.users.raw_user_meta_data`)
   - `options.emailRedirectTo`: `${NEXT_PUBLIC_SITE_URL}/auth/confirm`
4. Supabase sends a confirmation email to the user.
5. The form shows a verification-pending screen with a resend option (30s
   cooldown enforced client-side; rate-limit error handled server-side).
6. The `handle_new_user` database trigger fires on `auth.users INSERT` and
   creates a row in `public.profiles` with `id = auth.users.id`, `email`,
   `full_name`, `first_name`, `last_name` from user metadata.

Account-enumeration protection: whether the email already exists or is new,
the same success state is returned (only genuine network/rate-limit errors
produce error messages).

---

## Email Confirmation Flow

Route: `/auth/confirm` (GET handler)

Supabase email links land on `/auth/confirm?token_hash=...&type=signup`.

1. The Route Handler reads `token_hash` and `type` from the query string.
2. Calls `supabase.auth.verifyOtp({ type, token_hash })`.
3. On success: records a `signup` security event, records the trusted device,
   and redirects to `/dashboard` (the dashboard's provisioning gate then
   redirects to `/onboarding` if onboarding isn't complete).
4. On failure or missing parameters: redirects to `/auth-error`.

For password-recovery links (`type=recovery`): same flow but redirects to
`/update-password` instead.

---

## Sign-In Flow

Route: `/login` (alias: `/sign-in`)

1. User enters email and password.
2. `LoginForm.tsx` submits via `useActionState` to the `login` server action.
3. `login` calls `supabase.auth.signInWithPassword()`.
4. On success: records a `login` security event, records the trusted device,
   then checks `profiles.provisioned_at`:
   - Not provisioned → redirect to `/onboarding`
   - Provisioned → redirect to `/dashboard`
5. Errors: invalid credentials, network failures, and rate limits are handled
   with safe user-facing messages. The raw Supabase error is never surfaced.

---

## Session Persistence

Sessions survive:
- Browser refresh (middleware refreshes the token on each request)
- Direct URL navigation (server component re-validates via `getUser()`)
- Tab close and reopen (cookies persist per browser policy)
- Token expiry (middleware exchanges the refresh token automatically)

Sessions are invalidated by:
- `supabase.auth.signOut({ scope: 'local' })` — signs out the current session
- `supabase.auth.signOut({ scope: 'others' })` — signs out all other sessions

---

## Application Profile Provisioning

Every Supabase Auth user has exactly one row in `public.profiles` where
`profiles.id = auth.users.id`.

- **Creation**: `handle_new_user` trigger fires on `auth.users INSERT`. Inserts
  a profile row with `id`, `email`, `full_name`, `first_name`, `last_name`.
  Uses `ON CONFLICT (id) DO UPDATE` to safely backfill name fields from metadata
  if the profile already exists.
- **Idempotency**: The trigger is safe to fire more than once — the `ON CONFLICT`
  clause prevents duplicates and only fills NULL columns.

Full onboarding data (investor type, organization, country, compliance status,
provisioned_at) is written by `submitProvisioning()` when the user completes the
onboarding wizard.

---

## Onboarding Gate

`requireProvisionedUser()` in `apps/app/lib/auth/guards.ts`:
- Calls `requireUser()` (redirects to `/login` if unauthenticated)
- Fetches the profile and checks `profiles.provisioned_at`
- Redirects to `/onboarding` if `provisioned_at` is null

The dashboard layout calls this guard on every request. An authenticated user
cannot access `/dashboard` until `provisioned_at` is set by the provisioning
server action.

The onboarding page (`/onboarding`) does the inverse: if `provisioned_at` is
set it redirects to `/dashboard` immediately.

---

## Row Level Security

RLS is enabled on all user-owned tables. The canonical pattern:

```sql
-- Users can only read their own rows
create policy "profiles_select_own" on "public"."profiles"
  for select using (auth.uid() = id);

-- Users can only update their own rows
create policy "profiles_update_own" on "public"."profiles"
  for update using (auth.uid() = id) with check (auth.uid() = id);
```

Tables with RLS:
- `profiles` — select own, update own (provisioned_at set via admin client)
- `organizations` — select own, update own
- `investment_portfolios` — select own
- `wallets` — select own
- `wallet_transactions` — select own, insert own
- `custody_addresses` — select own, insert own
- `login_history` — select own
- `trusted_devices` — select own, insert own, update own
- `notifications` — select own, insert own, update own
- `documents` — select own
- `onboarding_drafts` — select own, insert own, update own
- `user_roles` — select own
- `audit_logs` — insert via service_role only

Privileged columns (`compliance_status`, `provisioned_at`, `account_status`)
are written only via the admin client in server actions. RLS prevents ordinary
users from setting these via the anon or authenticated role.

---

## Password Recovery Flow

1. User visits `/reset-password` (alias: `/forgot-password`) and submits email.
2. `resetPassword` action calls `supabase.auth.resetPasswordForEmail(email, {
   redirectTo: '${origin}/auth/confirm' })`.
3. Supabase sends a recovery email with a link to `/auth/confirm?type=recovery&token_hash=...`.
4. `/auth/confirm` route handler calls `verifyOtp({ type: 'recovery', token_hash })`,
   which establishes a recovery session, then redirects to `/update-password`.
5. `/update-password` checks for an active session. If none, shows an expiry
   message. If a session exists, shows the new-password form.
6. `updatePassword` action calls `supabase.auth.updateUser({ password })`,
   records a `password_updated` security event, and redirects to
   `/password-updated`.

---

## Protected Routes

All routes under `/dashboard/*`, `/onboarding`, and server actions are protected
server-side. The guard hierarchy:

```
requireUser()         — unauthenticated → /login
requireProvisionedUser()  — no profile.provisioned_at → /onboarding
requireRole(minRole)  — insufficient RBAC role → /dashboard
```

Guards use `redirect()` from `next/navigation`, which throws before returning
any data, so unauthenticated users never see protected content even briefly.

Redirect loop protection:
- `/login` → already authenticated → `/dashboard`
- `/dashboard` → not provisioned → `/onboarding`
- `/onboarding` → not authenticated → `/login`
- `/onboarding` → already provisioned → `/dashboard`

None of these paths form a cycle.

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + Server | Supabase publishable key (new format, replaces old anon JWT key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS for admin ops |
| `NEXT_PUBLIC_SITE_URL` | Server | Builds email redirect URLs |

Copy `apps/app/.env.example` to `apps/app/.env.local` for local development.

---

## Supabase Dashboard Configuration

### Authentication > URL Configuration

Set **Site URL** to your production domain:
```
https://app.neptlium.com
```

Add the following to **Redirect URLs**:
```
https://app.neptlium.com/auth/confirm
https://app.neptlium.com/update-password
http://localhost:3001/auth/confirm
http://localhost:3001/update-password
https://*.vercel.app/auth/confirm
https://*.vercel.app/update-password
```

### Authentication > Email Templates

**Confirm signup** — the `{{ .ConfirmationURL }}` token in the template resolves
to a link containing `token_hash` and `type=signup`, which lands on
`/auth/confirm`.

**Reset password** — the `{{ .ConfirmationURL }}` resolves to a link with
`type=recovery`, also landing on `/auth/confirm`.

### Authentication > Providers

- Email provider: enabled
- Confirm email: enabled (recommended for production)
- Secure email change: enabled
- Password minimum length: 8 characters (enforced by the application too)

### SMTP

Configure a custom SMTP provider (Resend, Postmark, SendGrid, etc.) for reliable
email delivery in production. Supabase's built-in email is rate-limited and not
suitable for production traffic.

---

## Local Development Setup

```bash
# Install dependencies (requires pnpm 11+)
pnpm install

# Copy env file
cp apps/app/.env.example apps/app/.env.local
# Fill in your Supabase project URL, anon key, and service role key

# Start dev server
pnpm --filter @netlium/app dev
```

---

## Vercel Production Setup

1. In Vercel project settings, add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your production domain)

2. In Supabase Dashboard, add your Vercel domain and preview URL pattern to
   the Redirect URLs list (see above).

---

## Common Authentication Errors

| Supabase error | User message shown |
|----------------|-------------------|
| `invalid_credentials` | "The email or password is incorrect." |
| `email_not_confirmed` | "The email or password is incorrect." |
| `already registered` | (silent — same success message shown) |
| Rate limit | "Too many attempts. Please wait before trying again." |
| Network failure | "We couldn't complete the request. Please try again." |
| Expired OTP | Redirect to `/auth-error` with recovery link |
| Expired recovery session | "/update-password" shows expiry message |

---

## Security Events

The `login_history` table records key authentication events tied to the
authenticated user's ID. Events logged:
- `login` — successful sign-in
- `logout` — explicit sign-out
- `signup` — email confirmed
- `password_updated` — password changed
- `password_reset_requested` — (email sent)
- `mfa_enrolled` — TOTP enrolled
- `mfa_unenrolled` — TOTP removed
- `sessions_revoked` — other sessions ended

Sensitive data (passwords, tokens, codes) is never stored.

---

## Deployment Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (environment: Production only)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain in Vercel
- [ ] Supabase Site URL set to production domain
- [ ] All redirect URLs added to Supabase allowlist
- [ ] SMTP configured in Supabase for production email delivery
- [ ] Email confirmation enabled in Supabase Auth settings
- [ ] Secure email change enabled
- [ ] All migrations applied to production Supabase project
- [ ] RLS verified on all tables
- [ ] `handle_new_user` trigger verified (creates profile on signup)
- [ ] Test full flow: sign up → verify → onboard → dashboard → sign out → sign in
