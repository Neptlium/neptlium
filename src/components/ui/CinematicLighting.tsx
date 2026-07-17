import { useEffect, useRef } from "react";

/**
 * CinematicLighting
 * A fixed, full-viewport background layer that subtly shifts hue, intensity, and
 * vignette as the user scrolls — mimicking the lighting transitions used on
 * Apple / Stripe / BlackRock institutional sites.
 *
 * Pure CSS variables driven by scroll progress (0 → 1). GPU-friendly.
 */
export const CinematicLighting = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        el.style.setProperty("--p", p.toFixed(4));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ ["--p" as string]: "0" }}
    >
      {/* Top warm key light — fades as you scroll */}
      <div
        className="absolute inset-x-0 top-0 h-[80vh]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(217 91% 60% / calc(0.22 * (1 - var(--p)))), transparent 70%)",
          transition: "opacity 200ms linear",
        }}
      />
      {/* Mid cyan rim light — peaks mid-scroll */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 35% at 80% 30%, hsl(189 94% 50% / calc(0.18 * (1 - abs(0.5 - var(--p)) * 2))), transparent 70%)",
        }}
      />
      {/* Bottom purple bloom — rises near end */}
      <div
        className="absolute inset-x-0 bottom-0 h-[80vh]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 100%, hsl(258 90% 66% / calc(0.20 * var(--p))), transparent 70%)",
        }}
      />
      {/* Slow drifting hue wash */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          background:
            "linear-gradient(180deg, hsl(217 47% 6%) 0%, hsl(220 39% 4%) 50%, hsl(258 30% 6%) 100%)",
          transform: "translateY(calc(var(--p) * -4%))",
        }}
      />
      {/* Vignette deepens with scroll */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, hsl(0 0% 0% / calc(0.35 + 0.25 * var(--p))) 100%)",
        }}
      />
    </div>
  );
};

export default CinematicLighting;
