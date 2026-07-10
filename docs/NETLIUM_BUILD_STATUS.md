# Netlium Systems — Build Status

_Last audited: 2026-07-10_

## Completion Estimate

**~35–40% toward the target architecture.**

- Platform foundation (monorepo, shared packages, Supabase backend, CI scaffolding): strong.
- Authentication + institutional design system: in progress, partially applied.
- Core product surface (dashboard, wallet, portfolio, allocations, transactions, documents, reports, settings): mostly unbuilt or placeholder.
- Organizations / multi-tenant institutional layer: not started.

## Existing Architecture

Turborepo monorepo, pnpm workspaces.

```
netliumsystems/
├── apps/
│   ├── app/            Next.js 16.2.10 app (authenticated platform) — active
│   └── admin/           empty scaffold (no files under app/)
├── packages/
│   ├── ui/              design system (Radix + CVA), Tailwind v4 tokens
│   ├── lib/              Supabase clients, auth/session/rbac helpers
│   ├── types/             shared domain models (no runtime, types only)
│   └── config/            shared eslint/prettier/tsconfig/tailwind config
├── supabase/
│   └── migrations/        2 files, UNTRACKED in git (see risks)
└── docs/                   present but empty except this file
```

`apps/web` (public marketing site referenced in README) was removed in a prior
commit (`9e58f50`) but README.md still describes it as existing — README is stale.

Stack: Next.js 16.2.10 (Turbopack, App Router), React 19.2, TypeScript 6.0.3 (strict),
Tailwind CSS 4.3 (CSS-first, no JS config in app), pnpm 11.9.0, Node 24.14, Turborepo 2.10.

## Completed Modules

- Monorepo scaffolding: workspaces, Turborepo pipelines, shared tsconfig/eslint/prettier base.
- `@netlium/types`: broad shared domain model set (13 files) — types only, no runtime.
- `@netlium/lib` Supabase clients: browser, server, middleware (session refresh), admin
  (service-role). All correctly separate anon/service-role boundaries.
- `packages/lib/src/rbac/roles.ts`: 6-tier role hierarchy (`user → operator → analyst →
  manager → admin → super_admin`) with `hasRole()` comparator.
- Auth flows: login, signup (3-step animated wizard), reset-password — all wired to real
  Supabase Server Actions (`app/(auth)/actions.ts`), not stubs.
- Session/route protection: `requireUser()` / `requireRole()` guards in `apps/app/lib/auth`,
  used by the dashboard layout.
- Proxy-based session refresh (`apps/app/proxy.ts` — Next.js 16's renamed middleware
  convention) wired to Supabase cookie refresh.
- Institutional design token system (`packages/ui/src/styles/tokens.css`): full Tailwind v4
  `@theme` palette, typography scale, motion tokens — applied throughout the auth flow.
- Supabase backend: a substantial existing schema (27 tables) covering treasury, portfolio,
  allocation, risk, audit, billing domains — far ahead of the frontend.
- A just-authored (uncommitted) security migration revoking public EXECUTE on 4
  SECURITY DEFINER fund functions that were previously callable by anon/authenticated.

## Partial / In-Progress Modules

- Dashboard shell (`AppShell`, `Sidebar`, `Header`) and all 6 dashboard pages (overview,
  portfolio, treasury, allocations, risk, documents) still use hardcoded generic Tailwind
  (`bg-slate-950`, `text-slate-400`, etc.) instead of the institutional token system —
  the design system migration only reached the auth flow, not the product shell.
- RBAC: role hierarchy and guards exist, but role is currently read from Supabase
  `auth.user_metadata` (`resolveRole.ts`, explicitly commented "Provisional"), not from
  the real `user_roles` table that already exists in the database. Nothing enforces that
  `user_metadata.role` matches `user_roles` — a user could self-elevate if metadata is
  ever client-settable.
- `packages/lib`: several modules are 0-byte stub files re-exported but empty
  (`auth/guards.tsx`, `auth/hooks.ts`, `auth/permissions.ts`, `auth/provider.tsx`,
  `auth/roles.ts`, `auth/session.ts`, `utils/*`, `api/index.ts`, `hooks/index.ts`,
  `validation/index.ts`). The app works around this by having its own parallel
  `apps/app/lib/auth` — meaning there are two auth layers, one dead.
- `apps/admin`: package scaffold exists in workspace but contains zero files.

## Missing Modules

- Routes: onboarding, wallet, portfolio (top-level), allocations (top-level), transactions,
  documents (top-level), reports, settings — per the target architecture, none exist yet
  outside the `dashboard/*` nesting used today.
- Supabase tables: `organizations`, `permissions`, `wallets`, `wallet_balances`,
  `documents`, `notifications`, `security_events` do not exist. Related but non-equivalent
  tables exist (`account_balances`, `deposit_addresses` instead of `wallets`; `audit_logs`
  instead of `security_events`).
- No shadcn/ui installation (`components.json` absent) — the design system is hand-built
  with Radix + CVA directly, which is fine, but README's claim of "shadcn/ui" is inaccurate.
- CI: `.github/workflows/{build,lint,ci}.yml` all exist but are **empty files** — no CI
  actually runs.
- No `vercel.json` / deployment config found anywhere in the repo.

## Recommended Next Implementation Order

1. Fix the two lint-blocking bugs (see Build Risks) — CI cannot be turned on until lint runs.
2. Decide and delete the dead `packages/lib` auth/hooks/utils stubs, or finish and use them
   instead of `apps/app/lib/auth` — currently duplicated.
3. Move role resolution from `user_metadata` to the real `user_roles` table (already exists
   in Supabase) before building anything else on top of RBAC.
4. Extend the institutional design token system from the auth flow into `AppShell`,
   `Sidebar`, `Header`, and all dashboard pages — currently visually inconsistent.
5. Commit the pending `supabase/migrations/` (currently untracked) — includes a real
   security fix.
6. Then proceed with the phase plan below (wallet infra, portfolio, organizations).
