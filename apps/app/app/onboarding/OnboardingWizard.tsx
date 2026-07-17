"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Building2, Check, Landmark, UserRound, WalletCards } from "lucide-react";
import { Button, Field, FieldError, Input, Label } from "@netlium/ui";
import {
  onboardingPayloadSchema,
  securityOptions,
  type InvestorType,
  type ProvisioningPayload,
  type SecurityOption
} from "@netlium/lib";
import { OnboardingShell } from "./components/OnboardingShell";
import { OnboardingPanel } from "./components/OnboardingPanel";
import { getOnboardingDraft, saveOnboardingDraft, submitProvisioning } from "./actions";
import { onboardingSteps } from "./wizard-steps";

type DraftData = Partial<ProvisioningPayload>;

const purposeCards: ReadonlyArray<{ value: InvestorType; title: string; description: string; icon: typeof UserRound }> = [
  { value: "individual", title: "Individual Investor", description: "Manage your personal digital capital, portfolio allocations, wallet balances, and investment performance.", icon: UserRound },
  { value: "business", title: "Business", description: "Operate company treasury and capital allocation.", icon: Building2 },
  { value: "family_office", title: "Family Office", description: "Coordinate long-term multi-generational capital.", icon: Landmark },
  { value: "treasury_team", title: "Treasury Team", description: "Institutional treasury operations and settlement.", icon: WalletCards },
  { value: "investment_firm", title: "Investment Firm", description: "Portfolio management across clients and mandates.", icon: BriefcaseBusiness }
];

const securityCards: ReadonlyArray<{ value: SecurityOption; title: string; description: string }> = [
  { value: "authenticator", title: "Authenticator App", description: "Recommended for a stronger, independent sign-in factor. You can configure this now or later." },
  { value: "email", title: "Email Verification", description: "Use your verified email to confirm significant account activity." },
  { value: "recovery_codes", title: "Recovery Codes", description: "Keep offline recovery codes for controlled account restoration." },
  { value: "trusted_device", title: "Trusted Device", description: "Recognize this device after successful authentication." }
];

export function OnboardingWizard({ email }: { readonly email: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<DraftData>({ securityChoices: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    getOnboardingDraft()
      .then((draft) => {
        setData({ securityChoices: [], ...draft.data });
        setStepIndex(draft.stepIndex);
      })
      .catch(() => setError("We could not restore your saved progress. You can continue from this step."))
      .finally(() => setReady(true));
  }, []);

  // Auto-start provisioning when the wizard reaches the provisioning screen.
  // The user already confirmed everything on the review step, so this removes
  // the redundant "Begin provisioning" click.
  useEffect(() => {
    if (stepIndex === 6 && ready && !provisioning && !error) {
      void (async () => {
        const parsed = onboardingPayloadSchema.safeParse(data);
        if (!parsed.success) {
          setStepIndex(5);
          setError("Review the required information before creating your workspace.");
          return;
        }
        setProvisioning(true);
        setError(null);
        try {
          const result = await submitProvisioning(parsed.data);
          if (result.ok) setStepIndex(7);
          else setError(result.error);
        } catch {
          setError("Your workspace could not be provisioned. Please check your connection and retry.");
        } finally {
          setProvisioning(false);
        }
      })();
    }
    // Only run when stepIndex transitions to 6 (ready guards against running before draft loads)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, ready]);

  const currentStep = onboardingSteps[stepIndex] ?? onboardingSteps[0];
  const completedStepKeys = onboardingSteps.slice(0, stepIndex).map((step) => step.key);

  function update<K extends keyof ProvisioningPayload>(key: K, value: ProvisioningPayload[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  async function advance(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError(null);
    if (stepIndex === 1 && (!data.firstName?.trim() || !data.lastName?.trim() || !data.country?.trim() || !data.timezone?.trim() || !data.language?.trim())) {
      setError("Complete all required profile fields.");
      return;
    }
    if (stepIndex === 2 && !data.investorType) {
      setError("Select how you will use Neptlium.");
      return;
    }
    if (stepIndex === 3 && !data.region?.trim()) {
      setError("Region is required.");
      return;
    }
    if (stepIndex === 5 && !data.acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    const nextStep = Math.min(stepIndex + 1, 7);
    try {
      await saveOnboardingDraft({ data, stepIndex: nextStep });
      setStepIndex(nextStep);
    } catch {
      setError("Your progress could not be saved. Check your connection and try again.");
    }
  }

  async function goBack() {
    const previous = Math.max(stepIndex - 1, 0);
    await saveOnboardingDraft({ data, stepIndex: previous });
    setStepIndex(previous);
  }

  async function retryProvisioning() {
    const parsed = onboardingPayloadSchema.safeParse(data);
    if (!parsed.success) {
      setStepIndex(5);
      setError("Review the required information before creating your workspace.");
      return;
    }
    setProvisioning(true);
    setError(null);
    try {
      const result = await submitProvisioning(parsed.data);
      if (result.ok) setStepIndex(7);
      else setError(result.error);
    } catch {
      setError("Your workspace could not be provisioned. Please check your connection and retry.");
    } finally {
      setProvisioning(false);
    }
  }

  function toggleSecurity(choice: SecurityOption) {
    const selected = data.securityChoices ?? [];
    update("securityChoices", selected.includes(choice) ? selected.filter((item) => item !== choice) : [...selected, choice]);
  }

  if (!ready) return null;

  return (
    <OnboardingShell currentStepKey={currentStep.key} completedStepKeys={completedStepKeys}>
      <OnboardingPanel>
        <div aria-live="polite" className="sr-only">{error ?? (provisioning ? "Provisioning workspace." : "")}</div>
        {stepIndex === 0 && (
          <section className="space-y-8">
            <div className="space-y-3">
              <p className="text-caption font-medium uppercase tracking-[0.16em] text-accent-primary">Account opening</p>
              <h1 className="text-h3 font-semibold tracking-tight text-text-primary">Welcome to Neptlium</h1>
              <p className="text-body text-text-secondary">Let&apos;s establish your institutional capital workspace.</p>
            </div>
            <div className="border-y border-border-default py-4"><p className="text-caption uppercase tracking-wide text-text-muted">Verified email</p><p className="mt-1 text-body-sm text-text-primary">{email}</p></div>
            <Button onClick={() => advance()} variant="accent" size="lg" className="w-full sm:w-auto">Continue</Button>
          </section>
        )}

        {stepIndex === 1 && (
          <form onSubmit={advance} className="space-y-5">
            <Heading title="Tell us about yourself" copy="Provide the operating details for your workspace." />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="First name" id="first-name" value={data.firstName ?? ""} onChange={(value) => update("firstName", value)} autoComplete="given-name" />
              <TextField label="Last name" id="last-name" value={data.lastName ?? ""} onChange={(value) => update("lastName", value)} autoComplete="family-name" />
            </div>
            <TextField label="Country" id="country" value={data.country ?? ""} onChange={(value) => update("country", value)} autoComplete="country-name" />
            <TextField label="Phone (optional)" id="phone" value={data.phone ?? ""} onChange={(value) => update("phone", value)} autoComplete="tel" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Timezone" id="timezone" value={data.timezone ?? ""} onChange={(value) => update("timezone", value)} autoComplete="off" placeholder="America/New_York" />
              <TextField label="Language" id="language" value={data.language ?? ""} onChange={(value) => update("language", value)} autoComplete="language" placeholder="English" />
            </div>
            <Error error={error} /><Actions onBack={goBack} />
          </form>
        )}

        {stepIndex === 2 && (
          <form onSubmit={advance} className="space-y-6">
            <Heading title="How will you use Neptlium?" copy="Select the operating context for this workspace." />
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Workspace purpose">
              {purposeCards.map(({ value, title, description, icon: Icon }) => <button key={value} type="button" role="radio" aria-checked={data.investorType === value} onClick={() => update("investorType", value)} className={`min-h-32 border p-4 text-left ${data.investorType === value ? "border-accent-primary bg-accent-primary/8" : "border-border-default hover:border-accent-primary/60"}`}><Icon className="mb-3 size-5 text-accent-primary" aria-hidden="true" /><span className="block text-body-sm font-medium text-text-primary">{title}</span><span className="mt-1 block text-caption leading-5 text-text-secondary">{description}</span></button>)}
            </div>
            <Error error={error} /><Actions onBack={goBack} />
          </form>
        )}

        {stepIndex === 3 && (
          <form onSubmit={advance} className="space-y-5">
            <Heading title="Identity &amp; Compliance" copy="Provide only the information required to establish your institutional operating context." />
            <TextField label="Country" id="identity-country" value={data.country ?? ""} onChange={(value) => update("country", value)} autoComplete="country-name" />
            <TextField label="Region" id="region" value={data.region ?? ""} onChange={(value) => update("region", value)} autoComplete="address-level1" />
            <TextField label="Organization name (if applicable)" id="organization" value={data.organizationName ?? ""} onChange={(value) => update("organizationName", value)} autoComplete="organization" />
            <TextField label="Website (optional)" id="website" value={data.website ?? ""} onChange={(value) => update("website", value)} autoComplete="url" placeholder="https://example.com" />
            <TextField label="Company role (optional)" id="company-role" value={data.companyRole ?? ""} onChange={(value) => update("companyRole", value)} autoComplete="organization-title" />
            <Error error={error} /><Actions onBack={goBack} />
          </form>
        )}

        {stepIndex === 4 && (
          <form onSubmit={advance} className="space-y-6">
            <Heading title="Secure your workspace" copy="Choose the safeguards you would like to configure now. All options remain available after account opening." />
            <div className="space-y-3">
              {securityCards.map((option) => <label key={option.value} className="flex cursor-pointer gap-3 border border-border-default p-4 has-[:checked]:border-accent-primary has-[:checked]:bg-accent-primary/8"><input type="checkbox" className="mt-1 size-4 accent-[--accent-primary]" checked={(data.securityChoices ?? []).includes(option.value)} onChange={() => toggleSecurity(option.value)} /><span><span className="block text-body-sm font-medium text-text-primary">{option.title}{option.value === "authenticator" && " (recommended)"}</span><span className="mt-1 block text-caption leading-5 text-text-secondary">{option.description}</span></span></label>)}
            </div>
            <Error error={error} /><Actions onBack={goBack} />
          </form>
        )}

        {stepIndex === 5 && (
          <form onSubmit={advance} className="space-y-6">
            <Heading title="Review your information" copy="Confirm your workspace configuration before provisioning begins." />
            <dl className="divide-y divide-border-default border-y border-border-default">
              <ReviewRow label="Profile" value={`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()} />
              <ReviewRow label="Purpose" value={purposeCards.find((card) => card.value === data.investorType)?.title ?? ""} />
              <ReviewRow label="Country" value={data.country ?? ""} />
              <ReviewRow label="Security choices" value={(data.securityChoices ?? []).length ? (data.securityChoices ?? []).map((choice) => securityCards.find((item) => item.value === choice)?.title).join(", ") : "Configure later"} />
            </dl>
            <label className="flex gap-3 text-body-sm text-text-secondary"><input type="checkbox" className="mt-1 size-4 accent-[--accent-primary]" checked={data.acceptedTerms ?? false} onChange={(event) => update("acceptedTerms", event.target.checked as true)} /><span>I agree to the <a className="text-accent-primary underline" href="/terms">Terms of Service</a> and <a className="text-accent-primary underline" href="/privacy">Privacy Policy</a>.</span></label>
            <Error error={error} /><Actions onBack={goBack} label="Create Workspace →" />
          </form>
        )}

        {stepIndex === 6 && (
          <section className="mx-auto max-w-md space-y-8 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-accent-primary/40 bg-accent-primary/10 text-2xl font-semibold text-accent-primary">N</div>
            <div><h1 className="text-h3 font-semibold text-text-primary">Provisioning workspace</h1><p className="mt-2 text-body-sm text-text-secondary">Establishing your institutional operating environment.</p></div>
            <ul className="space-y-3 text-left">{["Creating workspace", "Provisioning wallet", "Applying security policies", "Preparing dashboard", "Configuring portfolio engine"].map((item) => <li key={item} className="flex items-center gap-3 text-body-sm text-text-primary"><span className={`flex size-5 items-center justify-center rounded-full border ${provisioning ? "border-accent-primary animate-pulse" : error ? "border-danger" : "border-accent-primary bg-accent-primary/10"}`}>{!provisioning && !error && <Check className="size-3 text-accent-primary" />}</span>{item}</li>)}</ul>
            <Error error={error} />
            {error && <Button onClick={retryProvisioning} variant="accent" size="lg">Retry provisioning</Button>}
          </section>
        )}

        {stepIndex === 7 && (
          <section className="mx-auto max-w-md space-y-7 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent-primary text-canvas"><Check className="size-10" aria-hidden="true" /></div>
            <div><h1 className="text-h3 font-semibold text-text-primary">Workspace Ready</h1><p className="mt-3 text-body text-text-secondary">Your Neptlium workspace has been successfully provisioned.</p><p className="mt-1 text-body text-text-secondary">Your institutional operating environment is now ready.</p></div>
            <Button onClick={() => { router.refresh(); router.replace("/dashboard"); }} variant="accent" size="lg">Go to Dashboard →</Button>
          </section>
        )}
      </OnboardingPanel>
    </OnboardingShell>
  );
}

function Heading({ title, copy }: { readonly title: string; readonly copy: string }) { return <div className="space-y-2"><h1 className="text-h3 font-semibold tracking-tight text-text-primary">{title}</h1><p className="text-body-sm text-text-secondary">{copy}</p></div>; }
function TextField({ label, id, value, onChange, autoComplete, placeholder }: { readonly label: string; readonly id: string; readonly value: string; readonly onChange: (value: string) => void; readonly autoComplete: string; readonly placeholder?: string }) { return <Field><Label htmlFor={id}>{label}</Label><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} /></Field>; }
function Error({ error }: { readonly error: string | null }) { return error ? <FieldError>{error}</FieldError> : null; }
function Actions({ onBack, label = "Continue" }: { readonly onBack: () => void; readonly label?: string }) { return <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between"><Button type="button" variant="outline" onClick={onBack}>Back</Button><Button type="submit" variant="accent" size="lg" className="sm:min-w-36">{label}</Button></div>; }
function ReviewRow({ label, value }: { readonly label: string; readonly value: string }) { return <div className="flex justify-between gap-6 py-3 text-body-sm"><dt className="text-text-muted">{label}</dt><dd className="text-right text-text-primary">{value || "Not provided"}</dd></div>; }
