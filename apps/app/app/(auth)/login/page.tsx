import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { safeInternalPath } from "../auth-utils";

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  return (
    <LoginForm
      next={safeInternalPath(params.next, "")}
      callbackFailed={params.error === "confirmation_failed"}
    />
  );
}
