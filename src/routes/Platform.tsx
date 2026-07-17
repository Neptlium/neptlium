import {
  Wallet,
  Network,
  Cpu,
  ShieldCheck,
  Radio,
  FileBarChart,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTAButton } from "@/components/ui/CTAButton";
import { APP_URLS } from "@/lib/constants";

const layers = [
  {
    icon: Wallet,
    title: "Wallet Identity Layer",
    description:
      "Non-custodial XRP wallet verification anchors every account. Identity is bound to a wallet, not a password — Netlium never stores private keys.",
  },
  {
    icon: Network,
    title: "Capital Routing Layer",
    description:
      "Multi-asset routing across XRP, digital assets, and USD-linked rails. Allocations are mapped against eligibility, tier, and modeled exposure.",
  },
  {
    icon: Cpu,
    title: "Allocation Engine",
    description:
      "The decision substrate. Translates eligibility and modeled inputs into structured allocation outputs across Conservative, Balanced, and Institutional profiles.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Engine",
    description:
      "Risk-adjusted constraints applied to every allocation output. Disciplined controls precede execution — never the other way around.",
  },
  {
    icon: Radio,
    title: "Signal Layer",
    description:
      "Market signal ingestion and weighting. Inputs are processed into the allocation engine without exposing members to raw market noise.",
  },
  {
    icon: FileBarChart,
    title: "Reporting Layer",
    description:
      "Status-first portfolio reporting. Designed for allocators, not for speculation theater. Clarity, position state, and modeled context only.",
  },
];

const Platform = () => {
  return (
    <PageShell
      title="Platform"
      description="Netlium's six-layer institutional infrastructure for XRP-native capital allocation."
    >
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container-wide relative py-24 sm:py-32">
          <SectionHeader
            eyebrow="Platform"
            title="Six layers. One disciplined allocation pipeline."
            description="Netlium's infrastructure is engineered as discrete, auditable layers — from wallet identity through reporting. Each is built independently and composed into a single capital allocation system."
          />
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <div className="container-wide">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {layers.map((l, i) => (
              <FeatureCard
                key={l.title}
                icon={l.icon}
                title={l.title}
                description={l.description}
                index={String(i + 1).padStart(2, "0")}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-panel/40 py-20">
        <div className="container-wide">
          <div className="rounded-2xl border border-border bg-gradient-panel p-10 sm:p-14 text-center">
            <h3 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Build allocations on a serious infrastructure foundation.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Verify a wallet, view eligibility, and access the allocation
              engine.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CTAButton href={APP_URLS.signup} size="lg" showArrow>
                Become a Member
              </CTAButton>
              <CTAButton
                href={APP_URLS.dashboard}
                variant="secondary"
                size="lg"
              >
                Access Dashboard
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Platform;
