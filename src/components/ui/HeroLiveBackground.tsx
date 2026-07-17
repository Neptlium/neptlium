import { useEffect, useRef } from "react";

/**
 * Premium, near-invisible hero environment.
 * Layered background — no objects, no globe:
 *  - soft mesh gradient wash
 *  - blueprint architectural grid (radial-masked)
 *  - slow drifting light blooms
 *  - faint moving light streaks
 *  - subtle film grain + vignette
 *
 * Everything moves slowly. The background supports the content.
 * Honors prefers-reduced-motion. Pure presentation, GPU-friendly.
 */
export const HeroLiveBackground = () => {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 2;
      const y = (e.clientY / h - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Extremely restrained parallax — barely perceptible.
        el.style.setProperty("--mx", `${x * 8}px`);
        el.style.setProperty("--my", `${y * 8}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ["--mx" as string]: "0px", ["--my" as string]: "0px" }}
    >
      {/* Base mesh wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% -8%, hsl(217 91% 60% / 0.10), transparent 62%)," +
            "radial-gradient(45% 45% at 88% 12%, hsl(189 94% 43% / 0.06), transparent 60%)," +
            "linear-gradient(180deg, hsl(216 33% 3%), hsl(217 47% 5%))",
        }}
      />

      {/* Slow drifting light blooms — soft, low opacity */}
      <div
        className="motion-safe-anim absolute left-[8%] top-[18%] h-[46vmin] w-[46vmin] rounded-full opacity-[0.5] blur-[80px]"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, hsl(217 91% 60% / 0.28), transparent 62%)",
          animation: "drift-slow 34s ease-in-out infinite",
          transform: "translate(var(--mx), var(--my))",
        }}
      />
      <div
        className="motion-safe-anim absolute right-[6%] top-[8%] h-[52vmin] w-[52vmin] rounded-full opacity-[0.4] blur-[90px]"
        style={{
          background:
            "radial-gradient(circle at 55% 45%, hsl(189 94% 45% / 0.20), transparent 62%)",
          animation: "drift-slow 42s ease-in-out infinite reverse",
        }}
      />
      <div
        className="motion-safe-anim absolute bottom-[-10%] left-[38%] h-[44vmin] w-[44vmin] rounded-full opacity-[0.32] blur-[90px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(258 90% 66% / 0.18), transparent 62%)",
          animation: "drift-slow 52s ease-in-out infinite",
        }}
      />

      {/* Blueprint architectural grid */}
      <div className="blueprint-grid" />

      {/* Faint slow light streaks */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="motion-safe-anim absolute top-[32%] h-px w-[40%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(189 94% 60% / 0.5), transparent)",
            animation: "streak 18s linear infinite",
          }}
        />
        <div
          className="motion-safe-anim absolute top-[64%] h-px w-[32%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(217 91% 65% / 0.4), transparent)",
            animation: "streak 26s linear infinite",
            animationDelay: "8s",
          }}
        />
      </div>

      {/* Subtle grain + vignette for depth */}
      <div className="noise-layer" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 82% 70% at 50% 100%, hsl(0 0% 0% / 0.5), transparent 58%)",
        }}
      />
    </div>
  );
};

export default HeroLiveBackground;
