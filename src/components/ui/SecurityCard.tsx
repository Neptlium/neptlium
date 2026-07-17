import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status?: string;
  className?: string;
}

export const SecurityCard = ({
  icon: Icon,
  title,
  description,
  status = "Active",
  className,
}: SecurityCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-5 rounded-xl border border-border bg-gradient-panel p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-elevated text-primary transition-colors group-hover:border-primary/40">
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {status}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};
