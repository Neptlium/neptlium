"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../components/utils/cn";
import type { NavItem } from "./Sidebar";

const DRAWER_ID = "dashboard-mobile-navigation";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NeptliumMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 54 46"
      width={size}
      height={(size * 46) / 54}
      role="img"
      aria-label="Neptlium"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="0,0 36,0 28,17 0,17" fill="#0B8CFF" />
      <circle cx="32" cy="21" r="8" stroke="#0B8CFF" strokeWidth="3" />
      <polygon points="18,29 54,29 54,46 26,46" fill="#0B8CFF" />
    </svg>
  );
}

export interface MobileNavigationProps {
  readonly items: readonly NavItem[];
  readonly footer?: ReactNode;
}

export function MobileNavigation({ items, footer }: MobileNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => {
    const active = [...items]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isItemActive(pathname, item.href));
    return active?.label ?? "Dashboard";
  }, [items, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [];
    if (focusables.length > 0) {
      focusables[0]!.focus();
    } else {
      drawer?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const tabStops = drawer?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [];
      if (tabStops.length === 0) {
        event.preventDefault();
        drawer?.focus();
        return;
      }

      const first = tabStops[0]!;
      const last = tabStops[tabStops.length - 1]!;
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="flex h-full items-center gap-2 px-2 sm:px-3">
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls={DRAWER_ID}
          onClick={() => setOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-topnav"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <p className="min-w-0 flex-1 truncate text-body-sm font-semibold tracking-tight text-text-primary">{title}</p>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={open ? undefined : "true"}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-surface-overlay transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          ref={drawerRef}
          id={DRAWER_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          tabIndex={-1}
          className={cn(
            "relative flex h-[100dvh] w-[min(88vw,22.5rem)] max-w-[calc(100vw-0.75rem)] flex-col border-r border-border-hairline bg-sidebar shadow-lg transition-transform duration-200 motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          style={{
            paddingTop: "max(env(safe-area-inset-top), 0.75rem)",
            paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)"
          }}
        >
          <div className="flex items-center justify-between border-b border-border-hairline px-4 pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <NeptliumMark />
              <span className="truncate text-body-sm font-semibold tracking-[0.08em] text-text-primary">
                NEPTLIUM
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="inline-flex size-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Application navigation" className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = isItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      isActive
                        ? "border-border-default bg-surface-2 text-text-primary"
                        : "border-transparent text-text-secondary hover:border-border-hairline hover:bg-surface-2 hover:text-text-primary"
                    )}
                  >
                    {item.icon && (
                      <span
                        className={cn("shrink-0", isActive ? "text-accent-primary" : "text-text-muted")}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="min-w-0 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {footer && <div className="shrink-0 border-t border-border-hairline px-3 pt-3">{footer}</div>}
        </div>
      </div>
    </>
  );
}
