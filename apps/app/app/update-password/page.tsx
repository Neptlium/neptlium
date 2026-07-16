import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@netlium/ui";
import { AuthShell } from "../(auth)/components/AuthShell";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

/**
 * Landing page after a password-recovery link is verified in
 * /auth/confirm. Requires an active session — there is no other way to
 * reach this page than through that redirect or while already signed in.
 */
export default async function UpdatePasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <AuthShell>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-[36px] font-semibold tracking-tight text-text-primary">
              Your recovery link has expired
            </h1>
            <p className="text-[15px] text-text-muted">
              Request a new password-reset link to continue securely.
            </p>
          </div>
          <Button
            href="/reset-password"
            variant="cta"
            className="h-12 w-full rounded-full"
          >
            Request a new link
          </Button>
          <Link
            href="/login"
            className="text-center text-[14px] font-medium text-accent-primary"
          >
            Return to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return <UpdatePasswordForm />;
}
