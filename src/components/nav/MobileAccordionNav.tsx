import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { CTAButton } from "@/components/ui/CTAButton";
import { Logo } from "@/components/ui/Logo";
import { APP_URLS, NAV_ENTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileAccordionNavProps {
  onNavigate: () => void;
  onClose?: () => void;
}

/**
 * Premium glassmorphism slide-over mobile navigation.
 * Top-level items expand into accordion sections; only one at a time.
 */
export const MobileAccordionNav = ({ onNavigate, onClose }: MobileAccordionNavProps) => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col border-l border-border/60 bg-panel/80 shadow-elevated backdrop-blur-2xl">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 px-5 py-4">
        <Logo size={26} />
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose ?? onNavigate}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 py-4">
        <ul className="divide-y divide-border/60">

          {NAV_ENTRIES.map((entry) => {
            const isOpen = open === entry.label;
            const hasMega = Boolean(entry.mega);

            if (!hasMega) {
              return (
                <li key={entry.to}>
                  <Link
                    to={entry.to}
                    onClick={onNavigate}
                    className="flex w-full items-center justify-between py-4 text-base font-medium text-foreground"
                  >
                    {entry.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={entry.label}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : entry.label)}
                  className="flex w-full items-center justify-between py-4 text-left text-base font-medium text-foreground"
                >
                  <span>{entry.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <Link
                      to={entry.to}
                      onClick={onNavigate}
                      className="mb-2 inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                    >
                      Overview →
                    </Link>
                    <div className="space-y-4">
                      {entry.mega!.groups.map((group, gi) => (
                        <div key={gi}>
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
                                  className="flex items-start gap-3 rounded-md p-2.5 hover:bg-elevated"
                                >
                                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background/60 text-primary">
                                    <item.icon className="h-4 w-4" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-medium text-foreground">
                                      {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
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
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom CTAs */}
      <div className="border-t border-border bg-panel px-6 py-5">
        <div className="flex flex-col gap-2.5">
          <CTAButton href={APP_URLS.signup} variant="primary" size="md" showArrow>
            Institutional Access
          </CTAButton>
        </div>
      </div>
    </div>
  );
};
