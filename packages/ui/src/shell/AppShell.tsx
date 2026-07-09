import React from "react";

/**
 * AppShell — The institutional UI container for Netlium Systems.
 *
 * Provides the base layout structure:
 * - Sidebar navigation
 * - Main content area
 * - Institutional branding
 *
 * All pages should render within this shell for consistency.
 */
export interface AppShellProps {
  readonly children: React.ReactNode;
  readonly sidebar?: React.ReactNode;
  readonly header?: React.ReactNode;
}

export function AppShell({ children, sidebar, header }: AppShellProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation — horizontal bar on small screens, vertical rail on md+ */}
      <aside className="w-full shrink-0 border-b border-slate-800 bg-slate-900 p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="mb-4 text-lg font-semibold tracking-tight md:mb-8">Netlium</div>
        {sidebar && (
          <nav className="flex gap-2 overflow-x-auto md:block md:space-y-2 md:overflow-visible">
            {sidebar}
          </nav>
        )}
      </aside>

      {/* Header + Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex-1 overflow-auto bg-slate-950 p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
