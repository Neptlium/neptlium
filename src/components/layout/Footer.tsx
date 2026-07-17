import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { APP_URLS, FOOTER_LINKS, SITE } from "@/lib/constants";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-panel">
      <div className="container-wide py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
                <span className="font-display text-sm font-bold text-primary-foreground">
                  N
                </span>
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              XRP-native institutional allocation infrastructure. Structured
              participation for serious capital.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-foreground/90 transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-14" />

        <div className="mt-8 flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a
              href={APP_URLS.signup}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Institutional Access
            </a>
            <Link to="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>

        <p className="mt-6 max-w-4xl text-xs leading-relaxed text-muted-foreground/80">
          {SITE.legal}
        </p>
      </div>
    </footer>
  );
};
