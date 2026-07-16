"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@netlium/ui";
import { AuthShell } from "./components/AuthShell";

export interface AuthErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function AuthError({ reset }: AuthErrorProps) {
  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-[32px] font-semibold tracking-tight text-text-primary">
            We couldn&apos;t complete this request
          </h1>
          <p className="text-body-sm text-text-secondary text-balance">
            We couldn&apos;t complete your request. Please try again.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-11"
          onClick={() => reset()}
        >
          Try again
        </Button>
      </div>
    </AuthShell>
  );
}
