import {
  ArrowLeftRight,
  Bell,
  Briefcase,
  FileBarChart2,
  FileText,
  Landmark,
  Newspaper,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Wallet
} from "lucide-react";
import type { Role } from "@netlium/lib";
import type { NavItem } from "@netlium/ui";

export interface RoleAwareNavItem extends NavItem {
  readonly minRole: Role;
}

// Institutional information architecture per docs/DESIGN_SYSTEM.md's Navigation
// section, reconciled with the app's capital-operations nav (Treasury /
// Allocations / Risk). "Security" is folded into Settings rather than kept as
// a separate top-level item, per that section's "simple, predictable" mandate.
export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  { label: "Portfolio", href: "/dashboard/portfolio", minRole: "user", icon: <Briefcase className="size-4" /> },
  { label: "Neptlium Wallet", href: "/dashboard/wallet", minRole: "user", icon: <Wallet className="size-4" /> },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    minRole: "user",
    icon: <ArrowLeftRight className="size-4" />
  },
  { label: "Treasury", href: "/dashboard/treasury", minRole: "operator", icon: <Landmark className="size-4" /> },
  {
    label: "Allocations",
    href: "/dashboard/allocations",
    minRole: "analyst",
    icon: <SlidersHorizontal className="size-4" />
  },
  { label: "Risk", href: "/dashboard/risk", minRole: "manager", icon: <ShieldAlert className="size-4" /> },
  { label: "Documents", href: "/dashboard/documents", minRole: "user", icon: <FileText className="size-4" /> },
  { label: "Reports", href: "/dashboard/reports", minRole: "analyst", icon: <FileBarChart2 className="size-4" /> },
  { label: "Research", href: "/dashboard/research", minRole: "user", icon: <Newspaper className="size-4" /> },
  { label: "Notifications", href: "/dashboard/notifications", minRole: "user", icon: <Bell className="size-4" /> },
  { label: "Settings", href: "/dashboard/settings", minRole: "user", icon: <SettingsIcon className="size-4" /> },
  {
    label: "Administration",
    href: "/dashboard/administration",
    minRole: "admin",
    icon: <ShieldCheck className="size-4" />
  }
];
