import { type Role } from "@netlium/lib";

const KNOWN_ROLES: readonly Role[] = ["user", "operator", "analyst", "manager", "admin", "super_admin"];

interface UserWithMetadata {
  readonly user_metadata?: Record<string, unknown> | null;
}

// Provisional: reads role from Supabase auth user_metadata, defaulting to "user".
// Phase 2E's server-side authorization helpers should replace this with a proper
// role source (e.g. a roles table or JWT custom claims).
export function resolveRole(user: UserWithMetadata): Role {
  const role = user.user_metadata?.role;
  return typeof role === "string" && (KNOWN_ROLES as readonly string[]).includes(role)
    ? (role as Role)
    : "user";
}
