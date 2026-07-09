"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface SidebarProps {
  readonly items: readonly NavItem[];
}

export function Sidebar({ items }: SidebarProps): ReactElement {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block shrink-0 whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${
              isActive
                ? "bg-slate-800 text-slate-50"
                : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
