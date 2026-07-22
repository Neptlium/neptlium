"use client";

import Link from "next/link";
import { ChevronDown, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../components/utils/cn";

export interface ProfileMenuProps {
  readonly displayName: string;
  readonly email: string;
  readonly verified: boolean;
  readonly signOut: ReactNode;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const accountLinks = [
  { label: "Profile", href: "/dashboard/settings" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Security and access", href: "/dashboard/settings#security" },
  { label: "Identity verification", href: "/dashboard/settings#identity" },
  { label: "Notification preferences", href: "/dashboard/notifications" },
  { label: "Help and support", href: "/dashboard/documents" }
];

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "N"
  );
}

export function ProfileMenu({ displayName, email, verified, signOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function getFocusableElements() {
      return Array.from(panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

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
    getFocusableElements()[0]?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1.5 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring lg:px-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-primary/12 font-mono text-[12px] font-semibold text-accent-primary">
          {initials}
        </span>
        <span className="hidden max-w-[180px] truncate text-body-sm font-medium text-text-primary lg:block">
          {displayName}
        </span>
        <ChevronDown className="hidden size-4 lg:block" aria-hidden="true" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-surface-overlay transition-opacity lg:absolute lg:inset-auto lg:right-0 lg:top-12 lg:bg-transparent",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Account menu"
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl border border-border-hairline bg-surface-1 p-4 shadow-lg outline-none transition-transform lg:static lg:w-80 lg:rounded-xl",
            open ? "translate-y-0" : "translate-y-full lg:translate-y-0"
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-primary/12 font-mono text-[13px] font-semibold text-accent-primary">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-sm font-semibold text-text-primary">{displayName}</p>
                <p className="truncate text-[12px] text-text-muted">{email}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-text-muted">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {verified ? "Email verified" : "Verification pending"}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close account menu"
              onClick={() => setOpen(false)}
              className="inline-flex size-11 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="divide-y divide-border-hairline">
            <div className="space-y-1 py-2">
              {accountLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-3 text-body-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-3">{signOut}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
