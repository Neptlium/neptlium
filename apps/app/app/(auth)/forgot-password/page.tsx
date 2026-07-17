import { redirect } from "next/navigation";

// Canonical password-reset route is /reset-password. This page provides
// the standard URL alias so both /forgot-password and /reset-password
// reach the same destination.
export default function ForgotPasswordRedirectPage() {
  redirect("/reset-password");
}
