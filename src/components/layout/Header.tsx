import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { CTAButton } from "@/components/ui/CTAButton";
import { Logo } from "@/components/ui/Logo";
import { MegaMenu } from "@/components/nav/MegaMenu";
import { MobileAccordionNav } from "@/components/nav/MobileAccordionNav";
import { APP_URLS, NAV_ENTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();
  const closeTimer = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Close menu when clicking outside the header
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mega menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 220);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const activeEntry = NAV_ENTRIES.find((e) => e.label === openMenu);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-border bg-[hsl(0_0%_3%/0.92)] shadow-[0_1px_0_hsl(0_0%_100%/0.03)_inset,0_10px_30px_-12px_hsl(0_0%_0%/0.9)] backdrop-blur-xl"
    >
      <div className="container-wide flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center" aria-label="Netlium home">
          <Logo size={30} />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          onMouseLeave={scheduleClose}
        >
          {NAV_ENTRIES.map((entry) => {
            const hasMega = Boolean(entry.mega);
            const isOpen = openMenu === entry.label;

            if (!hasMega) {
              return (
                <NavLink
                  key={entry.to}
                  to={entry.to}
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMenu(null);
                  }}
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-md px-3.5 py-2.5 text-[0.9375rem] font-semibold tracking-tight transition-colors after:absolute after:inset-x-3.5 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-[hsl(var(--accent-emerald))] after:transition-transform after:duration-300 hover:after:scale-x-100",
                      isActive
                        ? "text-[hsl(var(--accent-emerald))] after:scale-x-100"
                        : "text-[hsl(0_0%_72%)] hover:text-[hsl(0_0%_90%)]"
                    )
                  }
                >
                  {entry.label}
                </NavLink>
              );
            }

            return (
              <div
                key={entry.label}
                className="relative"
                onMouseEnter={() => {
                  cancelClose();
                  setOpenMenu(entry.label);
                }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMenu(isOpen ? null : entry.label)}
                  onFocus={() => {
                    cancelClose();
                    setOpenMenu(entry.label);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3.5 py-2.5 text-[0.9375rem] font-semibold tracking-tight transition-colors",
                    isOpen
                      ? "text-[hsl(var(--accent-emerald))]"
                      : "text-[hsl(0_0%_72%)] hover:text-[hsl(0_0%_90%)]"
                  )}
                >
                  {entry.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center lg:flex">
          <CTAButton href={APP_URLS.signup} variant="primary" size="sm" showArrow>
            Institutional Access
          </CTAButton>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop mega menu panel */}
      {activeEntry?.mega && (
        <div
          className="absolute inset-x-0 top-full z-40 hidden lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {/* solid hover bridge so the cursor never crosses a dead gap */}
          <div className="h-2 w-full" />
          <div className="container-wide">
            <div key={activeEntry.label} className="animate-fade-up [animation-duration:180ms]">
              <MegaMenu
                entry={activeEntry}
                onNavigate={() => setOpenMenu(null)}
              />
            </div>
          </div>
        </div>
      )}


      {/* Mobile slide-over drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop with blur */}
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Glass slide-over panel */}
        <div
          className={cn(
            "absolute right-0 top-0 h-[100dvh] w-[88%] max-w-sm transform transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <MobileAccordionNav
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </div>
    </header>
  );
};
