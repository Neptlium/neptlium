import type { ReactNode } from "react";
import { AppShell, Header, Sidebar } from "@netlium/ui";
import { dashboardNavItems } from "@/components/navigation/dashboardNav";
import { filterNavByRole } from "@/components/security/filterNavByRole";
import { resolveRole } from "@/components/security/resolveRole";
import { SignOutButton } from "@/components/security/SignOutButton";
import { requireProvisionedUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const { user } = await requireProvisionedUser();
  const role = await resolveRole(user.id);
  const navItems = filterNavByRole(dashboardNavItems, role);

  return (
    <AppShell
      sidebar={<Sidebar items={navItems} />}
      header={<Header title="Neptlium" actions={<SignOutButton />} />}
    >
      {children}
    </AppShell>
  );
}
