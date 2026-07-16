"use client";

import { useActionState, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  Button,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
} from "@netlium/ui";
import { updatePassword } from "../(auth)/actions";
import { initialAuthActionState } from "../(auth)/schema";
import { AuthShell } from "../(auth)/components/AuthShell";
import { PasswordRequirements } from "../(auth)/components/PasswordRequirements";

const inputClass =
  "h-10 border-[color:var(--color-border-whisper)] bg-surface-1 transition-[border-color,box-shadow] focus:border-accent-primary focus:shadow-[var(--shadow-focus-ring)]";
const ctaClass = "h-11 w-full";

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialAuthActionState,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/.test(password)) {
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

  return (
    <AuthShell>
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <div className="space-y-2">
          <h1 className="text-[36px] font-semibold leading-tight tracking-tight text-text-primary">
            Create a new password
          </h1>
          <p className="text-[15px] text-text-muted">
            Choose a strong password for your Neptlium account.
          </p>
        </div>

        <Field>
          <Label htmlFor="update-password">New password</Label>
          <Input
            id="update-password"
            name="password"
            type="password"
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (passwordError) setPasswordError(null);
            }}
            onKeyUp={trackCapsLock}
            disabled={isPending}
            aria-invalid={Boolean(passwordError)}
            aria-describedby="update-password-requirements"
            className={inputClass}
          />
          {capsLock && <FieldHint>Caps Lock is on</FieldHint>}
          <div id="update-password-requirements">
            <PasswordRequirements {...{ password }} />
          </div>
        </Field>

        <Field>
          <Label htmlFor="update-confirm-password">Confirm new password</Label>
          <Input
            id="update-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (passwordError) setPasswordError(null);
            }}
            disabled={isPending}
            aria-invalid={Boolean(passwordError)}
            aria-describedby="update-password-error"
            className={inputClass}
          />
          <FieldError id="update-password-error">
            {passwordError ?? state.error}
          </FieldError>
        </Field>

        <Button
          type="submit"
          variant="cta"
          className={ctaClass}
          loading={isPending}
        >
          {isPending ? "Updating password…" : "Update Password →"}
        </Button>
      </form>
    </AuthShell>
  );
}
