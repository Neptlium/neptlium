import { LucideIcon } from "lucide-react";

interface FlowStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
}

export const FlowStep = ({
  step,
  icon: Icon,
  title,
  description,
  isLast,
}: FlowStepProps) => {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-elevated text-primary">
          <Icon className="h-5 w-5" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary font-mono text-[10px] font-bold text-primary-foreground">
            {step}
          </div>
        </div>
        {!isLast && (
          <div className="mt-2 h-full min-h-[40px] w-px flex-1 bg-gradient-to-b from-border to-transparent" />
        )}
      </div>
      <div className="pb-10 pt-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};
