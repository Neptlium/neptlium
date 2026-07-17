import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-md whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:shadow-[0_10px_60px_-12px_hsl(var(--primary)/0.7)] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-elevated text-foreground border border-border hover:-translate-y-0.5 hover:bg-accent hover:border-primary/40",
  ghost:
    "text-foreground/80 hover:text-foreground hover:bg-elevated",
  outline:
    "border border-border text-foreground hover:-translate-y-0.5 hover:bg-elevated hover:border-primary/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  external?: boolean;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type Props = ButtonProps | AnchorProps;

export const CTAButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      showArrow = false,
      className,
      children,
      external,
      ...rest
    } = props as Props & { className?: string };

    const cls = cn(base, variants[variant], sizes[size], className);
    const content = (
      <>
        {variant === "primary" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,hsl(0_0%_100%/0.35),transparent)] transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
          />
        )}
        <span className="relative inline-flex items-center gap-2">
          {children}
          {showArrow && (
            <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          )}
        </span>
      </>
    );

    if ("href" in props && props.href) {
      const isExternal =
        external ?? /^https?:\/\//.test(props.href as string);
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cls}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

CTAButton.displayName = "CTAButton";
