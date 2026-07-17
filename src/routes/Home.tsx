import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Network,
  Cpu,
  Wallet,
  Layers,
  Lock,
  LineChart,
  Radio,
  KeyRound,
  Eye,
  Webhook,
  ScrollText,
  Users,
  Send,
  Database,
  Bitcoin,
  Coins,
  Banknote,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { CTAButton } from "@/components/ui/CTAButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroLiveBackground } from "@/components/ui/HeroLiveBackground";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CinematicLighting } from "@/components/ui/CinematicLighting";
import { APP_URLS } from "@/lib/constants";

const capabilityBar = [
  { icon: Lock, label: "Private Settlement Infrastructure" },
  { icon: Cpu, label: "AI Allocation Engine" },
  { icon: Network, label: "Multi-Rail Capital Movement" },
  { icon: Coins, label: "USDC Base Settlement" },
  { icon: Database, label: "Institutional Ledger Architecture" },
  { icon: Eye, label: "Real-Time Treasury Visibility" },
];

/* Monochrome enterprise wordmarks (illustrative institutional partners). */
const enterpriseLogos = [
  "MERIDIAN",
  "ASTRALIS",
  "NORTHGATE",
  "VANTA CAPITAL",
  "SOLARIS",
  "KESTREL",
  "AXIOM RESERVE",
  "BRIDGEPORT",
];

const Home = () => {
  return (
    <PageShell
      title="Private Global Payments & Institutional AI Allocation"
      description="Netlium combines private financial infrastructure, programmable settlement rails, and AI-driven allocation systems into one sovereign-grade platform."
    >
      <CinematicLighting />

      {/* HERO */}
      <section className="relative">
        <div className="relative overflow-hidden">
          <HeroLiveBackground />
          <div className="container-wide relative flex items-center py-24 sm:py-28 lg:py-36">
            <div className="grid w-full items-center gap-14 lg:grid-cols-[1.15fr,1fr] lg:gap-20">
              <div className="min-w-0 max-w-3xl text-left">
                <h1 className="animate-fade-up text-left text-balance text-[2.5rem] font-bold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[4.75rem]">
                  <span className="block">The Operating System for</span>
                  <span className="block text-gradient-primary">Institutional Digital Capital.</span>
                </h1>

                <p
                  className="mt-7 max-w-xl animate-fade-up text-left text-pretty text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-xl"
                  style={{ animationDelay: "120ms" }}
                >
                  Netlium combines private financial infrastructure, programmable
                  settlement rails, and AI-driven allocation systems into one
                  sovereign-grade platform.
                </p>

                <div
                  className="mt-9 flex animate-fade-up flex-col items-start gap-3 sm:flex-row"
                  style={{ animationDelay: "240ms" }}
                >
                  <CTAButton href={APP_URLS.signup} size="lg" showArrow>
                    Institutional Access
                  </CTAButton>
                </div>

                <p
                  className="mt-6 animate-fade-up text-left text-xs text-muted-foreground/80"
                  style={{ animationDelay: "320ms" }}
                >
                  Modeled allocation outputs · Wallet-verified identity · Encrypted infrastructure
                </p>
              </div>

              {/* Hero product preview (static mockup) */}
              <div className="min-w-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
                <TerminalPreview />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CAPABILITY BAR */}
      <ScrollReveal as="section" variant="fade" className="section-seam relative z-10 bg-panel/50 backdrop-blur-md">
        <div className="container-wide py-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            {capabilityBar.map((t, i) => (
              <ScrollReveal
                key={t.label}
                variant="up"
                delay={i * 60}
                className="flex items-center gap-2.5 text-xs text-muted-foreground"
              >
                <t.icon className="h-4 w-4 text-primary/80" />
                <span className="leading-tight">{t.label}</span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ENTERPRISE TRUST — monochrome logo wall */}
      <section className="section-seam relative overflow-hidden py-24 sm:py-28">
        <div aria-hidden className="accent-electric opacity-60" />
        <div className="container-wide relative">
          <ScrollReveal variant="up" className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-elevated/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Trusted infrastructure
            </div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built for institutional capital operations
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Treasury, allocation, and settlement teams rely on Netlium as the
              execution layer for modern financial organizations.
            </p>
          </ScrollReveal>

          <ScrollReveal
            variant="up"
            delay={120}
            className="mx-auto mt-14 grid max-w-5xl grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {enterpriseLogos.map((name) => (
              <div key={name} className="flex items-center justify-center">
                <span className="enterprise-logo font-display text-base font-semibold tracking-[0.2em] sm:text-lg">
                  {name}
                </span>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>


      {/* PRIVATE PAYMENTS */}
      <section className="section-seam relative overflow-hidden py-24 sm:py-32">
        <div aria-hidden className="enterprise-grid" />
        <div aria-hidden className="accent-electric" />
        <div className="container-wide relative grid gap-14 lg:grid-cols-2 lg:items-center">
          <ScrollReveal variant="left">
            <SectionHeader
              eyebrow="Private Payments"
              title="Move capital privately across global rails."
              description="Programmable settlement infrastructure for institutions and sovereign allocators — engineered for discretion, control, and auditability."
            />
            <ul className="mt-8 space-y-3.5">
              {[
                ["Alias-based transfers", Send],
                ["Secure ledger settlement", Database],
                ["USDC Base settlement", Coins],
                ["Programmable transfer infrastructure", Network],
                ["Withdrawal orchestration", Workflow_],
                ["Real-time balances", Activity],
              ].map(([label, Icon]: any) => (
                <li key={label} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <CTAButton href={APP_URLS.login} showArrow>
                Open Payment Console
              </CTAButton>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="right" delay={120}>
            <PaymentMock />
          </ScrollReveal>
        </div>
      </section>

      {/* AI ALLOCATION ENGINE */}
      <section className="section-seam relative overflow-hidden bg-panel/40 py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="container-wide relative grid gap-14 lg:grid-cols-[1fr,1.1fr] lg:items-center">
          <ScrollReveal variant="left">
            <AllocationMock />
          </ScrollReveal>
          <ScrollReveal variant="right" delay={120}>
            <SectionHeader
              eyebrow="AI Allocation Engine"
              title="Allocation intelligence built for modern capital."
              description="A risk-aware allocation substrate inspired by institutional systems like BlackRock Aladdin — engineered for sovereign and programmable capital."
            />
            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {[
                ["AI-assisted allocation engine", Cpu],
                ["Portfolio visibility", Eye],
                ["Allocation scoring", LineChart],
                ["Risk-aware positioning", ShieldCheck],
                ["Treasury optimization", Activity],
                ["Capital distribution modeling", Layers],
              ].map(([label, Icon]: any) => (
                <li key={label} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <CTAButton href={APP_URLS.dashboard} showArrow>
                Access Allocation Engine
              </CTAButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* DIGITAL TREASURY */}
      <section className="section-seam relative overflow-hidden py-24 sm:py-32">
        <div aria-hidden className="enterprise-grid" />
        <div className="container-wide relative grid gap-14 lg:grid-cols-2 lg:items-center">
          <ScrollReveal variant="left">
            <SectionHeader
              eyebrow="Digital Treasury"
              title="Sovereign-grade treasury infrastructure."
              description="Unify multi-asset balances, programmable settlement, and institutional accounting in a single execution layer."
            />
            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {[
                ["Live balance management", Activity],
                ["Crypto settlement", Network],
                ["Base + BTC support", Bitcoin],
                ["Multi-asset visibility", Layers],
                ["Programmable withdrawals", Send],
                ["Institutional accounting", Banknote],
              ].map(([label, Icon]: any) => (
                <li key={label} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <CTAButton href={APP_URLS.app} showArrow>
                Launch Treasury
              </CTAButton>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="right" delay={120}>
            <TreasuryMock />
          </ScrollReveal>
        </div>
      </section>

      {/* WHITE EDITORIAL SHOWCASE */}
      <section className="relative overflow-hidden bg-white py-28 text-neutral-950 sm:py-36">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.6]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(217 30% 90% / 0.7) 1px, transparent 1px), linear-gradient(90deg, hsl(217 30% 90% / 0.7) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent 80%)",
          }}
        />
        <div className="container-wide relative">
          <div className="grid gap-16 lg:grid-cols-[1.05fr,1fr] lg:items-center">
            <ScrollReveal variant="left">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(217_91%_55%)]" />
                Infrastructure
              </div>
              <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-neutral-950 sm:text-5xl lg:text-6xl">
                Infrastructure that moves{" "}
                <span className="text-[hsl(217_91%_50%)]">institutional capital.</span>
              </h2>
              <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-neutral-600">
                Netlium unifies private payments, programmable treasury, and
                risk-aware allocation into a single execution layer — designed
                for the discipline, control, and scale that financial
                organizations demand.
              </p>
              <div className="mt-9">
                <a
                  href={APP_URLS.app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-neutral-950 px-6 text-base font-medium text-white transition-all duration-200 hover:bg-neutral-800"
                >
                  Explore the platform
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={120}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [Network, "Multi-rail settlement", "Route capital privately across global rails, observable end-to-end."],
                  [Cpu, "AI allocation", "Risk-aware positioning across programmable capital profiles."],
                  [Database, "Institutional ledger", "Append-only architecture with controlled state transitions."],
                  [ShieldCheck, "Enforced constraints", "Policy applied before any capital movement executes."],
                ].map(([Icon, title, desc]: any) => (
                  <div
                    key={title}
                    className="card-lift rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_1px_0_hsl(0_0%_0%/0.03),0_16px_32px_-24px_hsl(0_0%_0%/0.25)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-[hsl(217_91%_50%)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-base font-semibold text-neutral-950">{title}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{desc}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-seam bg-panel/40 py-24 sm:py-32">
        <div className="container-wide">
          <ScrollReveal>
            <SectionHeader
              eyebrow="How it works"
              title="Three steps. One execution layer."
              description="Onboard, fund, and execute under a unified institutional framework."
              align="center"
            />
          </ScrollReveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Create Identity", "Verified, wallet-anchored institutional identity."],
              ["02", "Fund Treasury", "Move capital into a private settlement environment."],
              ["03", "Execute Allocation & Settlement", "Deploy capital through the AI allocation engine."],
            ].map(([n, t, d], i) => (
              <ScrollReveal
                key={n}
                variant="up"
                delay={i * 120}
                className="card-lift rounded-xl border border-border bg-gradient-panel p-7"
              >
                <div className="font-mono text-xs text-primary">{n}</div>
                <div className="mt-3 text-lg font-semibold text-foreground">{t}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="section-seam relative overflow-hidden py-24 sm:py-32">
        <div aria-hidden className="enterprise-grid" />
        <div aria-hidden className="accent-electric" />
        <div className="container-wide relative">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Security"
              title="Built under institutional security assumptions."
              description="Confident, controlled, and auditable — engineered with the same discipline expected from a regulated financial counterparty."
            />
          </ScrollReveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              [Database, "Secure ledger architecture", "Append-only ledgers with controlled state transitions."],
              [Webhook, "Webhook verification", "Signed, replay-resistant event delivery."],
              [Workflow_, "Controlled settlement", "Multi-stage approval before capital movement."],
              [KeyRound, "Encrypted session infrastructure", "Hardened sessions with rotated credentials."],
              [ScrollText, "Auditability", "End-to-end traceability across the allocation pipeline."],
              [Users, "Role-based infrastructure", "Granular permissions across operators and approvers."],
              [Radio, "Real-time monitoring", "Continuous integrity and anomaly observation."],
              [ShieldCheck, "Risk-aware execution", "Constraints enforced before any capital movement."],
              [Lock, "Non-custodial identity", "Wallet-based verification, not custody-based access."],
            ].map(([Icon, title, desc]: any, i: number) => (
              <ScrollReveal
                key={title}
                variant="up"
                delay={(i % 3) * 100}
                className="card-lift rounded-xl border border-border bg-gradient-panel p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-elevated text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-base font-semibold text-foreground">{title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* APP PREVIEW */}
      <section className="section-seam bg-panel/40 py-24 sm:py-32">
        <div className="container-wide">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Platform"
              title="One execution layer. Every surface."
              description="Onboarding, deposits, allocation, balances, transfers, and institutional reporting — unified in a single console."
              align="center"
            />
          </ScrollReveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Onboarding", "Verified identity, wallet anchoring, and policy assignment."],
              ["Deposit UI", "Inbound capital with rail selection and confirmation."],
              ["Allocation Engine", "Modeled allocation across risk-aware profiles."],
              ["Balances", "Live multi-asset balances with treasury context."],
              ["Transfer Execution", "Programmable, alias-based capital movement."],
              ["Institutional Dashboard", "Status-first reporting and exposure visibility."],
            ].map(([t, d], i) => (
              <ScrollReveal
                key={t}
                variant="up"
                delay={(i % 3) * 100}
                className="group card-lift rounded-xl border border-border bg-background/40 p-6"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Surface
                </div>
                <div className="mt-2 text-base font-semibold text-foreground">{t}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-primary opacity-80 transition-opacity group-hover:opacity-100">
                  In console
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="mt-12 text-center" delay={200}>
            <CTAButton href={APP_URLS.app} size="lg" showArrow>
              Launch Netlium
            </CTAButton>
          </ScrollReveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <HeroLiveBackground />
        <div className="container-wide relative py-24 sm:py-32">
          <ScrollReveal variant="scale" className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              <span className="text-gradient">Capital infrastructure for the </span>
              <span className="text-gradient-primary">next financial era.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Private payments, programmable treasury systems, and intelligent
              allocation — unified into one execution layer.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CTAButton href={APP_URLS.app} size="lg" showArrow>
                Launch Netlium
              </CTAButton>
              <CTAButton href={APP_URLS.login} variant="secondary" size="lg">
                Access Platform
              </CTAButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageShell>
  );
};

/* ---------- Mock visuals (frontend-only, illustrative) ---------- */

import { Workflow as Workflow_ } from "lucide-react";

const TerminalPreview = () => (
  <div className="panel-elevated overflow-hidden">
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Netlium · Treasury
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-success">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        Live
      </div>
    </div>
    <div className="grid grid-cols-3 gap-px bg-border/60">
      {[
        ["Total Treasury", "$48.21M", "+0.42%"],
        ["Allocated", "$31.07M", "64.4%"],
        ["Available", "$17.14M", "35.6%"],
      ].map(([k, v, d]) => (
        <div key={k} className="bg-background/80 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
          <div className="mt-1 font-mono text-base font-semibold text-foreground">{v}</div>
          <div className="mt-0.5 font-mono text-[10px] text-success">{d}</div>
        </div>
      ))}
    </div>
    <div className="space-y-3 p-5">
      {[
        ["Allocation · Conservative", 28],
        ["Allocation · Balanced", 46],
        ["Allocation · Institutional", 70],
      ].map(([label, pct]: any) => (
        <div key={label}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono text-foreground">{pct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
    <div className="border-t border-border px-5 py-3 font-mono text-[10px] text-muted-foreground">
      <span className="text-success">●</span> settlement.usdc.base · ok
      <span className="mx-2 opacity-30">|</span>
      <span className="text-primary">●</span> ledger.sync · 1.2s
    </div>
  </div>
);

const PaymentMock = () => (
  <div className="panel-elevated p-6">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div className="text-sm font-medium text-foreground">New Transfer</div>
      <span className="rounded-md border border-border bg-elevated px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
        USDC · Base
      </span>
    </div>
    <div className="mt-5 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recipient alias</div>
        <div className="mt-1.5 rounded-md border border-border bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground">
          @sovereign.treasury
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</div>
        <div className="mt-1.5 rounded-md border border-border bg-background/60 px-3 py-2.5 font-mono text-2xl font-semibold text-foreground">
          1,250,000.00
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Verified", "Policy ✓", "Signed"].map((s) => (
          <div
            key={s}
            className="rounded-md border border-border bg-background/40 px-2.5 py-2 text-center font-mono text-[10px] text-muted-foreground"
          >
            {s}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="w-full rounded-md bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground"
      >
        Execute Settlement
      </button>
    </div>
  </div>
);

const AllocationMock = () => (
  <div className="panel-elevated p-6">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Allocation Engine</div>
        <div className="mt-1 text-sm font-semibold text-foreground">Portfolio · Q4</div>
      </div>
      <div className="font-mono text-[10px] text-success">Risk-aware</div>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3">
      {[
        ["Conservative", "32%", "Low"],
        ["Balanced", "44%", "Mod"],
        ["Institutional", "18%", "Struct"],
        ["Reserve", "6%", "Idle"],
      ].map(([k, v, t]) => (
        <div key={k} className="rounded-md border border-border bg-background/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
          <div className="mt-1 font-mono text-lg font-semibold text-foreground">{v}</div>
          <div className="mt-0.5 font-mono text-[10px] text-primary">{t}</div>
        </div>
      ))}
    </div>
    <div className="mt-5 h-24 rounded-md border border-border bg-background/40 p-3">
      <svg viewBox="0 0 200 60" className="h-full w-full">
        <defs>
          <linearGradient id="alloc-line" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" />
            <stop offset="50%" stopColor="hsl(189 94% 50%)" />
            <stop offset="100%" stopColor="hsl(258 90% 70%)" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="url(#alloc-line)"
          strokeWidth="1.5"
          points="0,45 20,40 40,42 60,30 80,32 100,22 120,26 140,18 160,20 180,12 200,14"
        />
      </svg>
    </div>
  </div>
);

const TreasuryMock = () => (
  <div className="panel-elevated p-6">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div className="text-sm font-medium text-foreground">Treasury · Multi-Asset</div>
      <span className="font-mono text-[10px] text-muted-foreground">Live</span>
    </div>
    <div className="mt-5 space-y-2.5">
      {[
        [Coins, "USDC", "Base", "$24,103,221"],
        [Bitcoin, "BTC", "Native", "$18,940,005"],
        [Wallet, "ETH", "Base", "$5,167,802"],
      ].map(([Icon, sym, rail, val]: any) => (
        <div
          key={sym}
          className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3.5 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-elevated text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{sym}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {rail}
              </div>
            </div>
          </div>
          <div className="font-mono text-sm text-foreground">{val}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Home;
