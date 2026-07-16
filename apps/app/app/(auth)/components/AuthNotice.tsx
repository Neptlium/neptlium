import { CheckCircle2, CircleAlert } from "lucide-react";

export function AuthNotice({
  children,
  variant = "error",
}: {
  readonly children: React.ReactNode;
  readonly variant?: "error" | "success";
}) {
  const Icon = variant === "success" ? CheckCircle2 : CircleAlert;
  const color = variant === "success" ? "text-success" : "text-danger";

  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-start gap-2 text-body-sm ${color}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
