import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTAButton } from "@/components/ui/CTAButton";
import { APP_URLS } from "@/lib/constants";

const About = () => {
  return (
    <PageShell
      title="About"
      description="Netlium is built for XRP holders and capital allocators who want structured participation, not speculative trading."
    >
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container-wide relative py-24 sm:py-32">
          <SectionHeader
            eyebrow="About"
            title="Structured participation. Not speculative trading."
            description="Netlium was built for the segment of the XRP ecosystem that wants disciplined, allocation-grade infrastructure — not another consumer crypto app."
          />
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <div className="container-narrow space-y-10">
          <div className="panel-elevated p-8 sm:p-10">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              The thesis
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The XRP ecosystem has serious capital and serious holders. What it
              has lacked is dedicated, institutional-grade allocation
              infrastructure — a system built around XRP-native primitives
              instead of forcing XRP into infrastructure designed for other
              networks.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Netlium is that infrastructure. A capital allocation system,
              multi-asset routing engine, and structured participation layer
              built for the XRP holder who treats capital with discipline.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-gradient-panel p-6">
              <h4 className="text-base font-semibold text-foreground">
                Who Netlium is for
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· XRP holders allocating capital seriously</li>
                <li>· Allocators seeking structured participation</li>
                <li>· Institutional capital above the $50K threshold</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-gradient-panel p-6">
              <h4 className="text-base font-semibold text-foreground">
                Who Netlium is not for
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· Day traders and speculators</li>
                <li>· Yield-chasers expecting guaranteed returns</li>
                <li>· Users looking for a wallet or exchange</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <CTAButton href={APP_URLS.signup} size="lg" showArrow>
              Become a Member
            </CTAButton>
            <CTAButton href="/contact" variant="secondary" size="lg" showArrow>
              Contact us
            </CTAButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default About;
