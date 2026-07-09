import type { Role } from "@netlium/lib";
import type { NavItem } from "@netlium/ui";

export interface RoleAwareNavItem extends NavItem {
  readonly minRole: Role;
}

// Provisional role thresholds — finalize alongside Phase 2E's RBAC/permission work.
export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  { label: "Overview", href: "/dashboard", minRole: "user" },
  { label: "Portfolio", href: "/dashboard/portfolio", minRole: "user" },
  { label: "Treasury", href: "/dashboard/treasury", minRole: "operator" },
  { label: "Allocations", href: "/dashboard/allocations", minRole: "analyst" },
  { label: "Risk", href: "/dashboard/risk", minRole: "manager" },
  { label: "Documents", href: "/dashboard/documents", minRole: "user" }
];
