import Link from "next/link";
import { Button } from "@netlium/ui";
import { AuthShell } from "../components/AuthShell";

export default function AuthErrorPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-[36px] font-semibold tracking-tight text-text-primary">
            We couldn&apos;t complete this request
          </h1>
          <p className="text-[15px] text-text-muted">
            The authentication link may be invalid or expired.
          </p>
        </div>
        <Button
          href="/login"
          variant="cta"
          className="h-12 w-full rounded-full"
        >
          Return to Sign In
        </Button>
        <Link
          href="/reset-password"
          className="text-center text-[14px] font-medium text-accent-primary"
        >
          Request a new link
        </Link>
      </div>
    </AuthShell>
  );
}
