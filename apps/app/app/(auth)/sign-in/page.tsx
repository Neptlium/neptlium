import { redirect } from "next/navigation";

// Canonical sign-in route is /login. This page provides the standard URL
// alias so both /sign-in and /login reach the same destination.
export default function SignInRedirectPage() {
  redirect("/login");
}
