import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { hasRole, type Role } from "@netlium/lib";
import { resolveRole } from "@/components/security/resolveRole";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  return user ? resolveRole(user) : null;
}

export async function hasPermission(minRole: Role): Promise<boolean> {
  const role = await getCurrentRole();
  return role !== null && hasRole(role, minRole);
}
