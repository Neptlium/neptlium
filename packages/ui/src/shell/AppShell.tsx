import type { ReactElement, ReactNode } from "react";

/** Inline SVG logomark — no image file dependency, works SSR/client. */
function NeptliumMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden>
      <defs>
        <linearGradient id="am-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1420" />
          <stop offset="100%" stopColor="#080E16" />
        </linearGradient>
        <linearGradient id="am-border" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="60%" stopColor="rgba(11,140,255,0.18)" />
          <stop offset="100%" stopColor="rgba(8,14,22,0)" />
        </linearGradient>
        <linearGradient id="am-n" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4aaeff" />
          <stop offset="55%" stopColor="#0B8CFF" />
          <stop offset="100%" stopColor="#1769F4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#am-bg)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="url(#am-border)" strokeWidth="1" />
      <path d="M7 7 L7 25 L13 25 L13 17 L19 25 L25 25 L25 7 L19 7 L19 15 L13 7 Z" fill="url(#am-n)" />
    </svg>
  );
}

/**
 * AppShell — Institutional dashboard container for Neptlium.
 *
 * Desktop: fixed 240px sidebar + scrollable content area with topbar.
 * Mobile/tablet: compact sticky header + main content + optional drawer trigger.
 *
 * Props:
 *   sidebar        — nav links rendered inside the desktop sidebar
 *   sidebarFooter  — user identity + sign-out anchored to sidebar bottom
 *   mobileNav      — mobile header/navigation component
 *
 * The legacy `header` prop is retained for backward compatibility but is no
 * longer rendered — the sidebar wordmark and mobile header replace it.
 */
export interface AppShellProps {
  readonly children: ReactNode;
  readonly sidebar?: ReactNode;
  readonly sidebarFooter?: ReactNode;
  readonly mobileNav?: ReactNode;
  /** @deprecated Pass sidebarFooter instead. Retained for backward compat. */
  readonly header?: ReactNode;
}

export function AppShell({
  children,
  sidebar,
  sidebarFooter,
  mobileNav
}: AppShellProps): ReactElement {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* ------------------------------------------------------------------ */}
      {/* Desktop sidebar — hidden on mobile                                  */}
      {/* ------------------------------------------------------------------ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border-hairline bg-sidebar lg:flex">
        {/* Wordmark */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border-hairline px-5">
          <NeptliumMark size={22} />
          <span className="text-body-sm font-semibold tracking-tight text-text-primary">
            Neptlium
          </span>
        </div>

        {/* Nav items */}
        {sidebar && (
          <nav
            aria-label="Dashboard navigation"
            className="flex-1 overflow-y-auto px-3 py-3"
          >
            {sidebar}
          </nav>
        )}

        {/* Footer — user info + sign out */}
        {sidebarFooter && (
          <div className="shrink-0 border-t border-border-hairline p-3">
            {sidebarFooter}
          </div>
        )}
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Main content column (offset by sidebar on desktop)                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col lg:pl-60">
        {/* Mobile compact header */}
        <header className="sticky top-0 z-20 h-14 shrink-0 border-b border-border-hairline bg-topnav lg:hidden">
          {mobileNav ?? (
            <div className="flex h-full items-center gap-2.5 px-4">
              <NeptliumMark size={20} />
              <span className="text-body-sm font-semibold tracking-tight text-text-primary">
                Neptlium
              </span>
            </div>
          )}
        </header>

        {/* Desktop topbar placeholder — keeps content below fixed sidebar header */}
        <div className="hidden h-14 shrink-0 border-b border-border-hairline bg-topnav lg:block" aria-hidden="true" />

        {/* Page content */}
        <main className="flex-1 overflow-auto px-4 py-6 md:px-6 md:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
