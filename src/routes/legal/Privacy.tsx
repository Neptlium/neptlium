import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/constants";

const sections = [
  {
    title: "Information we collect",
    body: "We collect information you provide directly — such as your name, work email, organization, and the details you share when requesting access or a demo. We also collect limited technical data (such as IP address and browser type) to operate and secure this website.",
  },
  {
    title: "How we use information",
    body: "We use the information to respond to access and demo requests, communicate about Netlium, improve our website, and meet legal and security obligations. We do not sell personal information.",
  },
  {
    title: "Data retention",
    body: "We retain inquiry and contact information only for as long as necessary to evaluate and respond to requests, and to comply with applicable legal requirements.",
  },
  {
    title: "Security",
    body: "We apply administrative, technical, and organizational safeguards designed to protect information against unauthorized access, disclosure, or loss.",
  },
  {
    title: "Your rights",
    body: "Depending on your jurisdiction, you may have rights to access, correct, or delete your personal information. To exercise these rights, contact us using the details below.",
  },
  {
    title: "Contact",
    body: `For privacy questions, contact ${SITE.email}.`,
  },
];

const Privacy = () => (
  <PageShell
    title="Privacy Policy"
    description="How Netlium collects, uses, and protects information on this institutional marketing website."
  >
    <section className="relative border-b border-border py-24 sm:py-28">
      <div aria-hidden className="enterprise-grid" />
      <div className="container-narrow relative">
        <SectionHeader
          eyebrow="Legal"
          title="Privacy Policy"
          description="This page describes how Netlium handles information submitted through this institutional marketing website."
        />
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PageShell>
);

export default Privacy;
