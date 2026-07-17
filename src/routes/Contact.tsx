import { FormEvent, useState } from "react";
import { Mail, Building2, Send, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTAButton } from "@/components/ui/CTAButton";
import { SITE, APP_URLS } from "@/lib/constants";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageShell
      title="Contact"
      description="Reach the Netlium team for institutional access, partnership, or platform inquiries."
    >
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container-wide relative py-24 sm:py-32">
          <SectionHeader
            eyebrow="Contact"
            title="Speak with the Netlium team."
            description="Reach out for institutional access, allocation inquiries, or partnership conversations. Investor access requests are reviewed directly."
          />
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <div className="container-wide grid gap-10 lg:grid-cols-[1.4fr,1fr]">
          <div className="panel-elevated p-8 sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                  Message received
                </h3>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  Thank you. The Netlium team will respond to your inquiry from{" "}
                  <span className="text-foreground">{SITE.email}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Send a message
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" name="name" required />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    required
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Organization" name="org" />
                  <Field
                    label="Allocation interest"
                    name="interest"
                    placeholder="Retail / Institutional"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="mt-2 w-full rounded-md border border-border bg-background/40 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Briefly describe your inquiry."
                  />
                </div>
                <div className="flex justify-end">
                  <CTAButton size="md" type="submit">
                    <Send className="h-4 w-4" />
                    Send message
                  </CTAButton>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-gradient-panel p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-elevated text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </div>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {SITE.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-gradient-panel p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-elevated text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Investor access
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    Institutional inquiries
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                For allocations above the $50,000 institutional threshold.
              </p>
              <div className="mt-4">
                <CTAButton
                  href={APP_URLS.signup}
                  variant="primary"
                  size="sm"
                  showArrow
                  className="w-full"
                >
                  Investor access
                </CTAButton>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
};

const Field = ({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="mt-2 w-full rounded-md border border-border bg-background/40 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

export default Contact;
