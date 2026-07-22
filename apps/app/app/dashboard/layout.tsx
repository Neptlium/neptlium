import type { ReactNode } from "react";
import { AppShell, MobileNavigation, ProfileMenu, Sidebar } from "@netlium/ui";
import { dashboardNavItems } from "@/components/navigation/dashboardNav";
import { filterNavByRole } from "@/components/security/filterNavByRole";
import { resolveRole } from "@/components/security/resolveRole";
import { SignOutButton } from "@/components/security/SignOutButton";
import { requireProvisionedUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const { user, profile } = await requireProvisionedUser();
  const role = await resolveRole(user.id);
  const navItems = filterNavByRole(dashboardNavItems, role);

  const displayName = profile?.fullName ?? profile?.email ?? user.email ?? "Account";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const accountMenu = (
    <ProfileMenu
      displayName={displayName}
      email={profile?.email ?? user.email ?? ""}
      verified={Boolean(user.email_confirmed_at)}
      signOut={<SignOutButton />}
    />
  );

  const sessionFooter = (
    <div className="space-y-2 px-1">
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {roleLabel}
      </p>
      <SignOutButton />
    </div>
  );

  return (
    <AppShell
      sidebar={<Sidebar items={navItems} />}
      sidebarFooter={sessionFooter}
      mobileNav={<MobileNavigation items={navItems} footer={sessionFooter} profile={accountMenu} />}
      utilityHeader={accountMenu}
    >
      {children}
    </AppShell>
  );
}
