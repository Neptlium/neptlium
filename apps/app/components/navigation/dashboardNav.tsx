import { Briefcase, Landmark, LayoutDashboard, SlidersHorizontal, Wallet } from "lucide-react";
import type { Role } from "@netlium/lib";
import type { NavItem } from "@netlium/ui";

export interface RoleAwareNavItem extends NavItem {
  readonly minRole: Role;
}

export const dashboardNavItems: readonly RoleAwareNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    minRole: "user",
    icon: <LayoutDashboard className="size-4" />
  },
  {
    label: "Portfolio",
    href: "/dashboard/portfolio",
    minRole: "user",
    icon: <Briefcase className="size-4" />
  },
  {
    label: "Neptlium Wallet",
    href: "/dashboard/wallet",
    minRole: "user",
    icon: <Wallet className="size-4" />
  },
  {
    label: "Treasury",
    href: "/dashboard/treasury",
    minRole: "user",
    icon: <Landmark className="size-4" />
  },
  {
    label: "Allocation",
    href: "/dashboard/allocations",
    minRole: "user",
    icon: <SlidersHorizontal className="size-4" />
  }
];
