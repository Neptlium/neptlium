import {
  Wallet,
  Network,
  Cpu,
  ShieldCheck,
  Radio,
  FileBarChart,
} from "lucide-react";

/**
 * Premium, abstract infrastructure diagram for the home hero / marketing
 * surfaces. Pure SVG + CSS, no external assets. Designed to feel like a
 * piece of financial infrastructure — not a crypto illustration.
 */
export const InfrastructureVisual = () => {
  const nodes: {
    id: string;
    label: string;
    sub: string;
    icon: typeof Wallet;
    x: number;
    y: number;
    accent?: "primary" | "secondary";
  }[] = [
    { id: "wallet", label: "Wallet Identity", sub: "XRP-verified", icon: Wallet, x: 8, y: 18, accent: "secondary" },
    { id: "routing", label: "Capital Routing", sub: "Multi-rail", icon: Network, x: 8, y: 78 },
    { id: "engine", label: "Allocation Engine", sub: "Decision substrate", icon: Cpu, x: 50, y: 48, accent: "primary" },
    { id: "risk", label: "Risk Engine", sub: "Constraints applied", icon: ShieldCheck, x: 92, y: 18 },
    { id: "signal", label: "Signal Layer", sub: "Weighted inputs", icon: Radio, x: 92, y: 78, accent: "secondary" },
    { id: "report", label: "Reporting", sub: "Status-first", icon: FileBarChart, x: 50, y: 96 },
  ];

  const links: [string, string][] = [
    ["wallet", "engine"],
    ["routing", "engine"],
    ["signal", "engine"],
    ["risk", "engine"],
    ["engine", "report"],
  ];

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-panel p-4 sm:p-6 shadow-elevated">
        {/* Grid background */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        {/* Soft glow accents */}
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: "hsl(217 91% 60% / 0.18)" }}
        />
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{ background: "hsl(25 100% 50% / 0.18)" }}
        />

        <div className="relative">
          {/* Top status bar */}
          <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Allocation pipeline · live
              </span>
            </div>
            <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              netlium / infra.v1
            </div>
          </div>

          {/* Diagram canvas */}
          <div className="relative aspect-[4/3] w-full">
            {/* SVG links */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="link-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0.0" />
                  <stop offset="50%" stopColor="hsl(25 100% 60%)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {links.map(([a, b], i) => {
                const A = byId[a];
                const B = byId[b];
                return (
                  <g key={i}>
                    <line
                      x1={A.x}
                      y1={A.y}
                      x2={B.x}
                      y2={B.y}
                      stroke="hsl(var(--border))"
                      strokeWidth="0.25"
                      strokeDasharray="0.8 0.8"
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={A.x}
                      y1={A.y}
                      x2={B.x}
                      y2={B.y}
                      stroke="url(#link-grad)"
                      strokeWidth="0.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes (HTML for crisp text) */}
            {nodes.map((n) => {
              const Icon = n.icon;
              const isPrimary = n.accent === "primary";
              const isSecondary = n.accent === "secondary";
              return (
                <div
                  key={n.id}
                  className="absolute"
                  style={{
                    left: `${n.x}%`,
                    top: `${n.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`relative flex items-center gap-2 rounded-lg border bg-background/90 px-2.5 py-2 backdrop-blur sm:px-3 sm:py-2.5 ${
                      isPrimary
                        ? "border-primary/40 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.6)]"
                        : isSecondary
                          ? "border-secondary/40 shadow-[0_0_24px_-10px_hsl(var(--secondary)/0.6)]"
                          : "border-border"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-md border ${
                        isPrimary
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : isSecondary
                            ? "border-secondary/40 bg-secondary/10 text-secondary"
                            : "border-border bg-elevated text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="hidden sm:block">
                      <span className="block text-[11px] font-semibold leading-tight text-foreground">
                        {n.label}
                      </span>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {n.sub}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom metric strip */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-md border border-border bg-background/60 p-2">
            {[
              ["Layers", "06"],
              ["Profiles", "03"],
              ["Custody", "Non"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-sm px-2 py-1.5"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {k}
                </span>
                <span className="font-mono text-xs text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
