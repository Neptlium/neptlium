import logoSrc from "/netlium-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withWordmark?: boolean;
  size?: number;
}

export const Logo = ({ className, withWordmark = true, size = 28 }: LogoProps) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <span
      className="relative inline-flex items-center justify-center rounded-[7px] p-[1.5px]"
      style={{
        background:
          "linear-gradient(145deg, hsl(0 0% 100% / 0.55), hsl(217 91% 60% / 0.35) 45%, hsl(216 33% 8%) 100%)",
        boxShadow:
          "0 0 22px hsl(217 91% 60% / 0.28), inset 0 1px 0 hsl(0 0% 100% / 0.3)",
      }}
    >
      <img
        src={logoSrc}
        alt="Netlium"
        width={size}
        height={size}
        className="rounded-[6px]"
        style={{ width: size, height: size }}
      />
    </span>
    {withWordmark && (
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Netlium
      </span>
    )}
  </span>
);

export default Logo;
