# Netlium Systems

> **Institutional Capital Operating System**

Netlium Systems is an institutional-grade capital operating system designed to provide secure, governed, and intelligent infrastructure for professional investors, capital allocators, family offices, treasury teams, investment firms, and digital asset operators.

The platform is engineered as institutional infrastructure—not a retail investment application—and is built to deliver governance, operational visibility, and capital intelligence through a unified operating environment.

---

# Vision

Netlium Systems exists to become the operating system for institutional digital capital.

Organizations should be able to operate every aspect of their capital from a single secure control environment, including:

* Treasury oversight
* Portfolio intelligence
* Capital allocation
* Performance reporting
* Investor administration
* Operational governance
* Risk monitoring
* Institutional reporting

The platform prioritizes trust, governance, transparency, and long-term maintainability above rapid feature expansion.

---

# Engineering Philosophy

Every engineering decision must reinforce four core principles:

* **Infrastructure before Investment**
* **Governance before Growth**
* **Intelligence before Marketing**
* **Trust before Conversion**

Netlium is designed as enterprise software with institutional standards from the first line of code.

---

# Repository Architecture

This repository is a **Turborepo monorepo** that contains multiple independently deployable Next.js applications sharing a common design system, shared libraries, and a single Supabase backend.

```text
netliumsystems/

├── apps/
│   ├── web/                    # Public institutional website
│   └── app/                    # Authenticated control platform
│
├── packages/
│   ├── ui/                     # Shared design system
│   ├── lib/                    # Shared Supabase & utilities
│   ├── config/                 # Shared configuration
│   └── types/                  # Shared domain models
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── storage/
│   └── policies/
│
├── .github/
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

# Applications

## apps/web

Public institutional website.

Purpose:

* Brand positioning
* Platform narrative
* Governance
* Security
* Research
* Company information
* Institutional trust
* Qualified investor acquisition

Production:

```
https://netliumsystems.com
```

---

## apps/app

Authenticated institutional operating platform.

Purpose:

* Executive dashboard
* Treasury management
* Portfolio intelligence
* Capital allocation
* Risk monitoring
* Operational reporting
* Investor communications
* Administrative workflows

Production:

```
https://app.netliumsystems.com
```

---

# Shared Packages

## packages/ui

Institutional design system.

Contains:

* shadcn/ui
* Radix UI
* Design tokens
* Layout primitives
* Typography
* Icons
* Motion standards
* Shared components

---

## packages/lib

Shared platform services.

Contains:

* Supabase clients
* Authentication helpers
* Server utilities
* Browser utilities
* API clients
* Validation
* Shared hooks

---

## packages/config

Shared engineering configuration.

Contains:

* ESLint
* TypeScript
* Tailwind CSS
* Prettier
* Build configuration

---

## packages/types

Shared domain models.

Examples:

* User
* Role
* Investor
* Portfolio
* TreasuryAccount
* CapitalAccount
* Allocation
* Transaction
* LedgerEntry
* Notification
* AuditLog
* Document

---

# Shared Backend

All applications connect to a single external Supabase project.

The backend is already established and should be treated as the authoritative data layer.

Frontend applications must consume the existing infrastructure rather than recreating database objects.

Core services include:

* Supabase Auth
* PostgreSQL
* Row Level Security
* Storage
* Edge Functions
* Database Migrations
* Realtime

---

# Existing Supabase Domain Modules

The current backend already contains institutional infrastructure for:

## Identity & Access

* profiles
* user_roles
* aliases

Roles:

* user
* operator
* analyst
* manager
* admin
* super_admin

Authentication is provided through Supabase Auth with Row Level Security enforced throughout the platform.

---

## Treasury

Existing infrastructure includes:

* Account balances
* Ledger entries
* Deposits
* Withdrawal requests
* Payment intents
* On-chain transactions

Capabilities:

* Treasury visibility
* Cash movement tracking
* Institutional ledger
* Settlement history

---

## Portfolio Intelligence

Existing infrastructure includes:

* Portfolios
* Holdings
* Assets
* Yield records

Capabilities:

* Portfolio composition
* Performance analysis
* Exposure monitoring

---

## Allocation Engine

Existing infrastructure includes:

* Strategies
* Strategy allocations
* Capital allocations
* Protocols

Capabilities:

* Capital deployment
* Strategy management
* Institutional allocation workflows

---

## Risk Intelligence

Existing infrastructure includes:

* Risk scores
* Market signals
* Whale signals
* Rebalancing events

Capabilities:

* Exposure monitoring
* Market intelligence
* Institutional risk analytics

---

## Operations

Existing infrastructure includes:

* Audit logs
* Notifications

Capabilities:

* Operational governance
* Activity tracking
* Auditability
* Administrative oversight

---

## Billing

Existing infrastructure includes:

* Subscriptions
* Payment intents

---

# Engineering Standards

Every contribution must be:

* Type-safe
* Secure
* Accessible
* Responsive
* Production-ready
* Well documented
* Scalable
* Tested

Avoid placeholder implementations in the main branch.

Every feature should be complete enough for production evolution.

---

# Security Principles

Security is foundational.

Mandatory requirements include:

* Row Level Security
* Least privilege access
* Role-based authorization
* Protected routes
* Session validation
* Audit logging
* Secure API communication

Frontend authorization enhances user experience but never replaces backend enforcement.

Supabase RLS remains the source of truth.

---

# Design Principles

Netlium should visually align with institutional software such as:

* Bloomberg Terminal
* Stripe Dashboard
* Mercury
* Ramp
* Coinbase Prime

Avoid:

* Retail crypto styling
* Meme aesthetics
* Neon color palettes
* Gamification
* Excessive visual effects

Design characteristics:

* Dark
* Minimal
* Structured
* Executive-grade
* Information-dense
* Trust-oriented

---

# Deployment

Each application deploys independently.

Public website:

```
apps/web
↓
https://netliumsystems.com
```

Control platform:

```
apps/app
↓
https://app.netliumsystems.com
```

Both applications share the same backend and internal packages while maintaining independent deployment pipelines.

---

# Development Roadmap

## Phase 1

Platform Foundation

* Turborepo
* Shared packages
* Supabase integration
* Authentication
* CI/CD

---

## Phase 2

Institutional Website

* Brand
* Research
* Governance
* Security
* Investor acquisition

---

## Phase 3

Institutional Control Platform

* Authentication
* Dashboard
* Portfolio
* Treasury
* Reporting
* Notifications

---

## Phase 4

Capital Operations

* Ledger
* Deposits
* Withdrawals
* Approvals
* Cash movements
* Operational workflows

---

## Phase 5

Institutional Administration

* Investor management
* Compliance
* Audit logs
* Operations
* Reporting
* Analytics

---

# Local Development

Install dependencies:

```bash
pnpm install
```

Run all applications:

```bash
pnpm dev
```

Build the workspace:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Type check:

```bash
pnpm check-types
```

---

# Mission

Netlium Systems is building institutional infrastructure for digital capital.

Every service, interface, and engineering decision should reinforce operational excellence, governance, transparency, and institutional confidence.
