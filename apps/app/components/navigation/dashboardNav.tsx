import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  FileBarChart2,
  FileText,
  LayoutDashboard,
  ListOrdered,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet
} from "lucide-react";
import type { Role } from "@netlium/lib";
import type { NavItem } from "@netlium/ui";

export interface RoleAwareNavItem extends NavItem {
  readonly minRole: Role;
}

/**
 * Institutional information architecture.
 * Items are grouped by the `group` property; Sidebar renders section headings.
 * AppShell and MobileNavigation both consume this shared source of truth.
 */
export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  // Overview
  {
    label: "Dashboard",
    href: "/dashboard",
    minRole: "user",
    group: "Overview",
    icon: <LayoutDashboard className="size-4" />
  },

  // Capital
  {
    label: "Portfolio",
    href: "/dashboard/portfolio",
    minRole: "user",
    group: "Capital",
    icon: <Briefcase className="size-4" />
  },
  {
    label: "Allocate Capital",
    href: "/dashboard/allocations",
    minRole: "user",
    group: "Capital",
    icon: <SlidersHorizontal className="size-4" />
  },
  {
    label: "Wallet",
    href: "/dashboard/wallet",
    minRole: "user",
    group: "Capital",
    icon: <Wallet className="size-4" />
  },

  // Operations
  {
    label: "Deposit",
    href: "/dashboard/deposit",
    minRole: "user",
    group: "Operations",
    icon: <ArrowDownLeft className="size-4" />
  },
  {
    label: "Transfer",
    href: "/dashboard/transfer",
    minRole: "user",
    group: "Operations",
    icon: <ArrowLeftRight className="size-4" />
  },
  {
    label: "Withdrawals",
    href: "/dashboard/withdrawals",
    minRole: "user",
    group: "Operations",
    icon: <ArrowUpRight className="size-4" />
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    minRole: "user",
    group: "Operations",
    icon: <ListOrdered className="size-4" />
  },

  // Records
  {
    label: "Documents",
    href: "/dashboard/documents",
    minRole: "user",
    group: "Records",
    icon: <FileText className="size-4" />
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    minRole: "analyst",
    group: "Records",
    icon: <FileBarChart2 className="size-4" />
  },
  {
    label: "Counterparties",
    href: "/dashboard/counterparties",
    minRole: "user",
    group: "Records",
    icon: <Users className="size-4" />
  },

  // Account
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    minRole: "user",
    group: "Account",
    icon: <Bell className="size-4" />
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    minRole: "user",
    group: "Account",
    icon: <SettingsIcon className="size-4" />
  },

  // Admin
  {
    label: "Administration",
    href: "/dashboard/administration",
    minRole: "admin",
    group: "Admin",
    icon: <ShieldCheck className="size-4" />
  }
];
