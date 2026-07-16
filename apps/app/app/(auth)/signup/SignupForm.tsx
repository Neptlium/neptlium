"use client";

import { useActionState, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import { Button, Field, FieldError, Input, Label } from "@netlium/ui";
import { resendVerification, signup } from "../actions";
import { initialAuthActionState } from "../schema";
import { AuthShell } from "../components/AuthShell";
import { AuthNotice } from "../components/AuthNotice";
import { PasswordRequirements } from "../components/PasswordRequirements";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

const inputClass =
  "h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] pl-10 transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";

const ctaClass = "h-12 w-full rounded-full text-[15px] font-semibold";

type Step = "email" | "password";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signup,
    initialAuthActionState,
  );
  const [resendState, resendAction, isResending] = useActionState(
    resendVerification,
    initialAuthActionState,
  );
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function handleEmailContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    setStep("password");
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    if (!PASSWORD_RE.test(password)) {
      event.preventDefault();
      setPasswordError("Password must meet all security requirements.");
      return;
    }
    if (password !== confirmPassword) {
      event.preventDefault();
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError(null);
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
              We sent a secure verification link to:
            </p>
            <p className="text-[15px] font-medium text-text-primary">{email}</p>
          </div>

          <p className="text-[15px] text-text-muted">
            Open the link in your email to continue setting up your Neptlium
            account.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <a
              href={`mailto:${email}`}
              className="inline-flex h-12 w-full items-center justify-center rounded-full [background:var(--gradient-cta-primary)] text-[15px] font-semibold text-white shadow-sm hover:brightness-110"
            >
              Open email
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
                    : "Resend verification email"}
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
                setStep("email");
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  /* ── Step 1: Email ── */
  if (step === "email") {
    return (
      <AuthShell>
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-[36px] font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-[40px]">
              Create your
              <br />
              Neptlium account
            </h1>
            <p className="text-[15px] text-text-muted">
              Enter your email to get started.
            </p>
          </div>

          <form onSubmit={handleEmailContinue} className="flex flex-col gap-5">
            <Field>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby="signup-email-error"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
              <FieldError id="signup-email-error">{emailError}</FieldError>
            </Field>

            <Button type="submit" variant="cta" className={ctaClass}>
              Continue →
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

  /* ── Step 2: Password ── */
  return (
    <AuthShell>
      <button
        type="button"
        onClick={() => setStep("email")}
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
          onSubmit={handlePasswordSubmit}
          className="flex flex-col gap-5"
        >
          {/* Hidden email field so the server action receives it */}
          <input type="hidden" name="email" value={email} />

          <Field>
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoFocus
              autoComplete="new-password"
              disabled={isPending}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              aria-invalid={Boolean(passwordError)}
              aria-describedby="signup-password-requirements"
              className="h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]"
            />
            <div id="signup-password-requirements">
              <PasswordRequirements {...{ password }} />
            </div>
          </Field>

          <Field>
            <Label htmlFor="signup-confirm-password">Confirm password</Label>
            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              aria-invalid={Boolean(passwordError)}
              aria-describedby="signup-password-error"
              className="h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]"
            />
            <FieldError id="signup-password-error">
              {passwordError ?? state.error}
            </FieldError>
          </Field>

          <Button
            type="submit"
            variant="cta"
            className={ctaClass}
            loading={isPending}
          >
            {isPending ? "Creating account…" : "Create Account →"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
