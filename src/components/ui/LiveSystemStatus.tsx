import { Cpu, Network, ShieldCheck, Activity, Database, Radio } from "lucide-react";

const SYSTEMS = [
  { icon: Network, label: "Settlement Network", status: "Active" },
  { icon: Cpu, label: "Allocation Engine", status: "Operational" },
  { icon: Activity, label: "Treasury Synchronization", status: "Live" },
  { icon: ShieldCheck, label: "Risk Monitoring", status: "Active" },
  { icon: Radio, label: "Multi-Rail Routing", status: "Online" },
  { icon: Database, label: "Ledger Integrity", status: "Verified" },
];

export const LiveSystemStatus = () => (
  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
    {SYSTEMS.map((s) => (
      <div
        key={s.label}
        className="flex items-center justify-between gap-3 bg-background/70 px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-elevated text-primary">
            <s.icon className="h-4 w-4" />
          </span>
          <div className="text-sm font-medium text-foreground">{s.label}</div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-success">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          {s.status}
        </div>
      </div>
    ))}
  </div>
);

export default LiveSystemStatus;
