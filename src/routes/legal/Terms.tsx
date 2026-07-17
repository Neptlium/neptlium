import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/constants";

const sections = [
  {
    title: "Acceptance of terms",
    body: "By accessing this website you agree to these terms. This website is an institutional marketing site and does not provide financial, investment, or operational services.",
  },
  {
    title: "No financial advice",
    body: "All content is provided for informational purposes only. Any allocation outputs, figures, or illustrations are modeled and illustrative, are not guarantees of performance, and do not constitute financial, legal, or investment advice.",
  },
  {
    title: "Intellectual property",
    body: "The Netlium name, brand, content, and design are owned by Netlium and may not be reproduced without permission.",
  },
  {
    title: "Acceptable use",
    body: "You agree not to misuse this website, attempt to disrupt its operation, or access it in a way that violates applicable law.",
  },
  {
    title: "Limitation of liability",
    body: "This website is provided on an \u201cas is\u201d basis. To the maximum extent permitted by law, Netlium disclaims liability for any damages arising from use of this website.",
  },
  {
    title: "Contact",
    body: `For questions about these terms, contact ${SITE.email}.`,
  },
];

const Terms = () => (
  <PageShell
    title="Terms of Service"
    description="The terms governing use of the Netlium institutional marketing website."
  >
    <section className="relative border-b border-border py-24 sm:py-28">
      <div aria-hidden className="enterprise-grid" />
      <div className="container-narrow relative">
        <SectionHeader
          eyebrow="Legal"
          title="Terms of Service"
          description="These terms govern your use of the Netlium institutional marketing website."
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

export default Terms;
