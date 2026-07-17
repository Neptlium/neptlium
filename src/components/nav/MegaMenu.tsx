import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { NavEntry } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MegaMenuProps {
  entry: NavEntry;
  onNavigate?: () => void;
}

/**
 * Stripe-inspired mega menu panel. Rendered inside the desktop header
 * dropdown; positioning is controlled by the parent.
 */
export const MegaMenu = ({ entry, onNavigate }: MegaMenuProps) => {
  if (!entry.mega) return null;
  const { mega } = entry;
  const hasFooter = Boolean(mega.footer);

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-panel/95 shadow-elevated backdrop-blur-xl"
      role="menu"
    >
      <div
        className={cn(
          "grid",
          hasFooter ? "lg:grid-cols-[1.6fr,1fr]" : "lg:grid-cols-1"
        )}
      >
        {/* Left: groups */}
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {mega.title}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {mega.description}
            </p>
          </div>

          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
            {mega.groups.map((group, gi) => (
              <div key={gi} className="space-y-1">
                {group.heading && (
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {group.heading}
                  </div>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className="group flex items-start gap-3 rounded-md p-2.5 transition-colors hover:bg-elevated"
                        role="menuitem"
                      >
                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background/60 text-primary transition-colors group-hover:border-primary/40">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right: footer panel */}
        {mega.footer && (
          <div className="relative border-t border-border bg-elevated/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div className="relative flex h-full flex-col">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Featured
              </div>
              <h4 className="mt-2 text-base font-semibold text-foreground">
                {mega.footer.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {mega.footer.description}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  to={mega.footer.to}
                  onClick={onNavigate}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  {mega.footer.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
