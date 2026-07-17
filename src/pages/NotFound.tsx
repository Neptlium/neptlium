import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

const NotFound = () => {
  return (
    <PageShell title="Page not found">
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container-narrow relative flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            404
          </div>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            <span className="text-gradient">Page not found.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            The page you're looking for doesn't exist. Return to the Netlium
            homepage.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gradient-primary px-6 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110"
            >
              Back to home
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default NotFound;
