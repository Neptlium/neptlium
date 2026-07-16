"use client";

import { Check } from "lucide-react";

const requirements = [
  ["8+ characters", (value: string) => value.length >= 8],
  ["1 uppercase letter", (value: string) => /[A-Z]/.test(value)],
  ["1 number", (value: string) => /\d/.test(value)],
  ["1 special character", (value: string) => /[^A-Za-z0-9]/.test(value)],
] as const;

export function PasswordRequirements({
  password,
}: {
  readonly password: string;
}) {
  return (
    <ul
      className="space-y-1 text-body-sm text-text-muted"
      aria-label="Password requirements"
    >
      {requirements.map(([label, passes]) => (
        <li
          key={label}
          className={
            passes(password)
              ? "flex items-center gap-2 text-success"
              : "flex items-center gap-2"
          }
        >
          <Check className="size-3.5" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
