"use client";

import { useActionState, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  Button,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
} from "@netlium/ui";
import { login } from "../actions";
import { initialAuthActionState } from "../schema";
import { AuthShell } from "../components/AuthShell";
import { AuthNotice } from "../components/AuthNotice";

const emailInputClass =
  "h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] pl-10 transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";
const passwordInputClass =
  "h-12 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";
const ctaClass = "h-12 w-full rounded-full text-[15px] font-semibold";

export function LoginForm({
  next,
  callbackFailed,
}: {
  readonly next?: string;
  readonly callbackFailed?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    login,
    initialAuthActionState,
  );
  const [capsLock, setCapsLock] = useState(false);
  const [email, setEmail] = useState("");

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-[36px] font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-[40px]">
            Sign in to
            <br />
            Neptlium
          </h1>
          <p className="text-[15px] text-text-muted">
            Access your institutional capital operating environment.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="next" value={next ?? ""} />
          {callbackFailed && (
            <AuthNotice>
              This verification link is invalid or has expired. Request a new
              link to continue.
            </AuthNotice>
          )}
          <Field>
            <Label htmlFor="login-email">Email address</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <Input
                id="login-email"
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
                className={emailInputClass}
              />
            </div>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link
                href="/reset-password"
                className="text-[12px] text-text-muted hover:text-text-secondary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              onKeyUp={trackCapsLock}
              disabled={isPending}
              aria-invalid={Boolean(state.error)}
              aria-describedby="login-error"
              className={passwordInputClass}
            />
            {capsLock && <FieldHint>Caps Lock is on</FieldHint>}
            <FieldError id="login-error">{state.error}</FieldError>
          </Field>

          <Button
            type="submit"
            variant="cta"
            className={ctaClass}
            loading={isPending}
          >
            {isPending ? "Signing in…" : "Sign In →"}
          </Button>
        </form>

        <p className="text-center text-[14px] text-text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent-primary hover:brightness-110"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
