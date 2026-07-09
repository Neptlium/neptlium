import { redirect } from "next/navigation";
import { hasRole, type Role } from "@netlium/lib";
import { resolveRole } from "@/components/security/resolveRole";
import { getCurrentUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(minRole: Role) {
  const user = await requireUser();
  const role = resolveRole(user);

  if (!hasRole(role, minRole)) {
    redirect("/dashboard");
  }

  return { user, role };
}
