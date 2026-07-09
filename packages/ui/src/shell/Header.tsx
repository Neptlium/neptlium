import type { ReactElement, ReactNode } from "react";

export interface HeaderProps {
  readonly title: string;
  readonly actions?: ReactNode;
}

export function Header({ title, actions }: HeaderProps): ReactElement {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </header>
  );
}
