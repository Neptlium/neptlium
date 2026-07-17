import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  hint?: string;
  className?: string;
}

export const StatCard = ({ value, label, hint, className }: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-gradient-panel p-6",
        className
      )}
    >
      <div className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground/90">{label}</div>
      {hint && (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  );
};
