import { Button } from "@netlium/ui";
import { requireUser } from "@/lib/auth";
import { signOutAction } from "@/components/security/actions";
import { AuthShell } from "../components/AuthShell";

export default async function UnauthorizedPage() {
  await requireUser();

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-[36px] font-semibold tracking-tight text-text-primary">
            Access restricted
          </h1>
          <p className="text-[15px] text-text-muted">
            Your account does not have permission to access this area.
          </p>
        </div>
        <Button
          href="/dashboard"
          variant="cta"
          className="h-12 w-full rounded-full"
        >
          Return to Dashboard
        </Button>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            className="h-12 w-full rounded-full"
          >
            Sign Out
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
