import { Button } from "@netlium/ui";
import { AuthShell } from "../components/AuthShell";
import { safeInternalPath } from "../auth-utils";

export default async function SessionExpiredPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeInternalPath(next, "/dashboard");

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-[36px] font-semibold tracking-tight text-text-primary">
            Your session has expired
          </h1>
          <p className="text-[15px] text-text-muted">
            Sign in again to continue securely.
          </p>
        </div>
        <Button
          href={`/login?next=${encodeURIComponent(destination)}`}
          variant="cta"
          className="h-12 w-full rounded-full"
        >
          Sign In →
        </Button>
      </div>
    </AuthShell>
  );
}
