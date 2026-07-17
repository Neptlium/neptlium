import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type Variant = "up" | "fade" | "scale" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  threshold?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  once?: boolean;
}

/**
 * Cinematic scroll-reveal wrapper.
 * Uses IntersectionObserver + CSS transforms. GPU-friendly, no layout thrash.
 * Honors prefers-reduced-motion.
 */
export const ScrollReveal = ({
  children,
  variant = "up",
  delay = 0,
  threshold = 0.18,
  className = "",
  as: Tag = "div",
  once = true,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const initial: Record<Variant, string> = {
    up: "translate3d(0, 28px, 0)",
    fade: "translate3d(0,0,0)",
    scale: "scale(0.96)",
    left: "translate3d(-32px,0,0)",
    right: "translate3d(32px,0,0)",
  };

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : initial[variant],
    transition:
      "opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 1100ms cubic-bezier(0.22, 1, 0.36, 1), filter 900ms cubic-bezier(0.22,1,0.36,1)",
    transitionDelay: `${delay}ms`,
    filter: shown ? "blur(0)" : "blur(6px)",
    willChange: "opacity, transform, filter",
  };

  // @ts-expect-error dynamic tag
  return <Tag ref={ref} className={className} style={style}>{children}</Tag>;
};

export default ScrollReveal;
