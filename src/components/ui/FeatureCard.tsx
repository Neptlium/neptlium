import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  index?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
  index,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-lg border border-border bg-gradient-panel p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-elevated text-primary transition-colors group-hover:border-primary/40">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {index && (
          <span className="font-mono text-xs text-muted-foreground">
            {index}
          </span>
        )}
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
