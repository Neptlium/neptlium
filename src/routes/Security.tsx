import {
  ShieldCheck,
  KeyRound,
  Lock,
  ServerCog,
  Activity,
  GitBranch,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SecurityCard } from "@/components/ui/SecurityCard";
import { CTAButton } from "@/components/ui/CTAButton";
import { APP_URLS } from "@/lib/constants";

const items = [
  {
    icon: KeyRound,
    title: "Non-custodial wallet verification",
    description:
      "Member identity is anchored to a verified XRP wallet. Authentication is verification-based, not custody-based.",
  },
  {
    icon: Lock,
    title: "No private key storage",
    description:
      "Netlium never stores, transmits, or has visibility into your private keys. Wallets remain entirely under member control.",
  },
  {
    icon: ServerCog,
    title: "Authenticated application layer",
    description:
      "The application layer uses authenticated session management aligned with industry-standard authentication practices.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted infrastructure assumptions",
    description:
      "Communication and data layers are designed under encrypted-in-transit and at-rest assumptions across the allocation pipeline.",
  },
  {
    icon: Activity,
    title: "Status-first financial UX",
    description:
      "The dashboard surfaces position state, modeled context, and allocation status — not speculative performance theater.",
  },
  {
    icon: GitBranch,
    title: "Capital movement controls",
    description:
      "Capital movement runs through controlled, auditable pathways governed by the risk framework before execution.",
  },
];

const Security = () => {
  return (
    <PageShell
      title="Security"
      description="Non-custodial wallet verification, no private key storage, encrypted infrastructure assumptions, and disciplined capital movement controls."
    >
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container-wide relative py-24 sm:py-32">
          <SectionHeader
            eyebrow="Security"
            title="Designed under institutional security assumptions."
            description="Netlium's security posture is built around non-custodial identity, controlled capital movement, and encrypted infrastructure assumptions across the allocation pipeline."
          />
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <div className="container-wide">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <SecurityCard
                key={it.title}
                icon={it.icon}
                title={it.title}
                description={it.description}
              />
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <CTAButton href={APP_URLS.signup} size="lg" showArrow>
              Become a Member
            </CTAButton>
            <CTAButton href="/contact" variant="secondary" size="lg" showArrow>
              Contact security team
            </CTAButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Security;
