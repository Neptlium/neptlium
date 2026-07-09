import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <SignupForm />;
}
