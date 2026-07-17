"use client";

import { useActionState, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, MailCheck, Eye, EyeOff } from "lucide-react";
import { Button, Field, FieldError, Input, Label } from "@netlium/ui";
import { resendVerification, signup } from "../actions";
import { emailPattern, passwordPattern } from "../auth-utils";
import { initialAuthActionState } from "../schema";
import { AuthShell } from "../components/AuthShell";
import { AuthNotice } from "../components/AuthNotice";
import { PasswordRequirements } from "../components/PasswordRequirements";

const inputClass =
  "h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] pl-10 transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";

const inputClassPlain =
  "h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";

const ctaClass = "h-12 w-full rounded-full text-[15px] font-semibold";

type Step = "identity" | "credentials";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signup,
    initialAuthActionState,
  );
  const [resendState, resendAction, isResending] = useActionState(
    resendVerification,
    initialAuthActionState,
  );

  const [step, setStep] = useState<Step>("identity");

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Step 2 fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function handleIdentityContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firstName.trim()) {
      setIdentityError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setIdentityError("Last name is required.");
      return;
    }
    if (!emailPattern.test(email)) {
      setIdentityError("Enter a valid email address.");
      return;
    }
    setIdentityError(null);
    setStep("credentials");
  }

  function handleCredentialSubmit(event: FormEvent<HTMLFormElement>) {
    if (!passwordPattern.test(password)) {
      event.preventDefault();
      setCredentialError("Password must meet all security requirements.");
      return;
    }
    if (password !== confirmPassword) {
      event.preventDefault();
      setCredentialError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      event.preventDefault();
      setCredentialError(
        "You must accept the Terms of Service and Privacy Policy.",
      );
      return;
    }
    setCredentialError(null);
  }

  /* ── Email sent / verify screen ── */
  if (state.success) {
    return (
      <AuthShell>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-10 flex items-center gap-2 text-[13px] text-text-muted hover:text-text-secondary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <MailCheck className="size-5 text-success" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-text-primary">
              Verify your email
            </h1>
            <p className="text-[15px] text-text-muted">
              We&apos;ve sent a secure verification link to:
            </p>
            <p className="text-[15px] font-medium text-text-primary">{email}</p>
          </div>

          <p className="text-[15px] text-text-muted">
            Open the link in your email to continue setting up your Neptlium
            account.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <a
              href={`mailto:${encodeURIComponent(email)}`}
              className="inline-flex h-12 w-full items-center justify-center rounded-full [background:var(--gradient-cta-primary)] text-[15px] font-semibold text-white shadow-sm hover:brightness-110 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]"
            >
              Open Email
            </a>
            <form action={resendAction}>
              <input type="hidden" name="email" value={email} />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="h-12 w-full rounded-full text-[15px]"
                loading={isResending}
                disabled={cooldown > 0}
                onClick={() => setCooldown(30)}
              >
                {isResending
                  ? "Resending…"
                  : cooldown
                    ? `Resend available in ${cooldown}s`
                    : "Resend Link"}
              </Button>
            </form>
            {resendState.success && (
              <AuthNotice variant="success">{resendState.message}</AuthNotice>
            )}
            {resendState.error && <AuthNotice>{resendState.error}</AuthNotice>}
            <button
              type="button"
              className="pt-1 text-center text-[14px] text-accent-primary hover:brightness-110"
              onClick={() => {
                setEmail("");
                setStep("identity");
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  /* ── Step 1: Identity (name + email) ── */
  if (step === "identity") {
    return (
      <AuthShell>
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-[36px] font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-[40px]">
              Create your
              <br />
              Neptlium Account
            </h1>
            <p className="text-[15px] text-text-muted">
              Begin your institutional capital workspace.
            </p>
          </div>

          <form
            onSubmit={handleIdentityContinue}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="signup-first-name">First name</Label>
                <Input
                  id="signup-first-name"
                  name="firstName"
                  type="text"
                  autoFocus
                  autoComplete="given-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (identityError) setIdentityError(null);
                  }}
                  aria-invalid={Boolean(identityError)}
                  className={inputClassPlain}
                />
              </Field>
              <Field>
                <Label htmlFor="signup-last-name">Last name</Label>
                <Input
                  id="signup-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (identityError) setIdentityError(null);
                  }}
                  aria-invalid={Boolean(identityError)}
                  className={inputClassPlain}
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="signup-email">Email address</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (identityError) setIdentityError(null);
                  }}
                  aria-invalid={Boolean(identityError)}
                  aria-describedby="signup-identity-error"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
              <FieldError id="signup-identity-error">{identityError}</FieldError>
            </Field>

            <Button type="submit" variant="cta" className={ctaClass}>
              Continue
            </Button>
          </form>

          <p className="text-center text-[14px] text-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accent-primary hover:brightness-110"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  /* ── Step 2: Password + ToS ── */
  return (
    <AuthShell>
      <button
        type="button"
        onClick={() => setStep("identity")}
        className="mb-10 flex items-center gap-2 text-[13px] text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>

      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Secure your account
          </h1>
          <p className="text-[15px] text-text-muted">
            Create a password for your Neptlium account.
          </p>
        </div>

        <form
          action={formAction}
          onSubmit={handleCredentialSubmit}
          className="flex flex-col gap-5"
        >
          {/* Hidden fields so the server action receives all values */}
          <input type="hidden" name="firstName" value={firstName} />
          <input type="hidden" name="lastName" value={lastName} />
          <input type="hidden" name="email" value={email} />

          <Field>
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoFocus
                autoComplete="new-password"
                disabled={isPending}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (credentialError) setCredentialError(null);
                }}
                aria-invalid={Boolean(credentialError)}
                aria-describedby="signup-password-requirements"
                className="h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] pr-10 transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <div id="signup-password-requirements">
              <PasswordRequirements {...{ password }} />
            </div>
          </Field>

          <Field>
            <Label htmlFor="signup-confirm-password">Confirm password</Label>
            <div className="relative">
              <Input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (credentialError) setCredentialError(null);
                }}
                aria-invalid={Boolean(credentialError)}
                aria-describedby="signup-credential-error"
                className="h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] pr-10 transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showConfirm ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <FieldError id="signup-credential-error">
              {credentialError ?? state.error}
            </FieldError>
          </Field>

          {/* Terms of Service acceptance */}
          <label className="flex cursor-pointer items-start gap-3 text-[13px] text-text-muted">
            <input
              type="checkbox"
              name="acceptedTerms"
              value="on"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (credentialError) setCredentialError(null);
              }}
              aria-required="true"
              className="mt-0.5 size-4 accent-[--accent-primary]"
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-accent-primary hover:brightness-110"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-accent-primary hover:brightness-110"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <Button
            type="submit"
            variant="cta"
            className={ctaClass}
            loading={isPending}
          >
            {isPending ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
