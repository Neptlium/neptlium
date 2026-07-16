import { Check } from "lucide-react";
import { Button } from "@netlium/ui";
import { AuthShell } from "../components/AuthShell";

export default function PasswordUpdatedPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-[36px] font-semibold tracking-tight text-text-primary">
            Password updated
          </h1>
          <p className="text-[15px] text-text-muted">
            Your Neptlium account password has been changed successfully.
          </p>
          <p className="text-[14px] text-text-muted">
            For your security, review active sessions after signing in.
          </p>
        </div>
        <Button
          href="/login"
          variant="cta"
          className="h-12 w-full rounded-full"
        >
          Sign In →
        </Button>
      </div>
    </AuthShell>
  );
}
