import { redirect } from "next/navigation";

// Canonical sign-up route is /signup. This page provides the standard URL
// alias so both /sign-up and /signup reach the same destination.
export default function SignUpRedirectPage() {
  redirect("/signup");
}
