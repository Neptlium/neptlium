"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button, Field, FieldError, Input, Label } from "@netlium/ui";
import { resetPassword } from "../actions";
import { initialAuthActionState } from "../schema";
import { AuthShell } from "../components/AuthShell";

const inputClass =
  "h-10 border-[color:var(--color-border-whisper)] bg-surface-1 transition-[border-color,box-shadow] focus:border-accent-primary focus:shadow-[var(--shadow-focus-ring)]";
const ctaClass = "h-11 w-full";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialAuthActionState,
  );
  const [email, setEmail] = useState("");

  if (state.success) {
    return (
      <AuthShell>
        <div className="flex flex-col gap-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
            <MailCheck className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="text-[32px] font-semibold tracking-tight text-text-primary">
              Check your email
            </h1>
            <p className="text-[15px] text-text-muted">
              If an account exists for that address, we sent a secure
              password-reset link.
            </p>
          </div>
          <Link
            href="/login"
            className="text-[14px] font-medium text-accent-primary hover:brightness-110"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form action={formAction} className="flex flex-col gap-6">
        <div className="space-y-2">
          <Link
            href="/login"
            className="mb-1 inline-flex items-center gap-2 text-[14px] text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Sign In
          </Link>
          <h1 className="text-[36px] font-semibold leading-tight tracking-tight text-text-primary">
            Reset your password
          </h1>
          <p className="text-[15px] text-text-muted">
            Enter the email address associated with your Neptlium account.
          </p>
        </div>
        <Field>
          <Label htmlFor="reset-email">Email address</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoFocus
            autoComplete="email"
            inputMode="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            aria-invalid={Boolean(state.error)}
            aria-describedby="reset-email-error"
            className={inputClass}
          />
          <FieldError id="reset-email-error">{state.error}</FieldError>
        </Field>
        <Button
          type="submit"
          variant="cta"
          className={ctaClass}
          loading={isPending}
        >
          {isPending ? "Sending link…" : "Send reset link →"}
        </Button>
      </form>
    </AuthShell>
  );
}
