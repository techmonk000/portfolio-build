"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SmoothScroll() {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Small delay so DOM is fully painted after BootScreen fade
    const timer = setTimeout(() => {
      ctx.current = gsap.context(() => {

        // ── ScrollSmoother ─────────────────────────────────────────────
        ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 0.9,
          effects: true,
          normalizeScroll: true,
          onUpdate: () => ScrollTrigger.update(),
        });

        // Refresh after smoother is ready so ScrollTrigger positions are accurate
        ScrollTrigger.refresh();

        // ── Stagger reveal helpers ──────────────────────────────────────
        // NOTE: we do NOT set initial opacity:0 globally — only inside the
        // fromTo so elements are visible if JS is slow or trigger misses.

        const reveal = (
          selector: string,
          from: gsap.TweenVars,
          to: gsap.TweenVars,
          stagger = 0,
          start = "top 88%"
        ) => {
          gsap.utils.toArray<HTMLElement>(selector).forEach((el, i) => {
            // Set initial state only right before animating
            gsap.set(el, from);
            gsap.to(el, {
              ...to,
              delay: i * stagger,
              scrollTrigger: {
                trigger: el,
                start,
                toggleActions: "play none none none",
              },
            });
          });
        };

        // 1. Section headings — wipe in from left
        reveal(
          ".section-heading",
          { opacity: 0, x: -28 },
          { opacity: 1, x: 0, duration: 0.65, ease: "power3.out" },
          0,
          "top 90%"
        );

        // 2. Holographic panels — fade + slide up
        reveal(
          ".holo-reveal",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          0,
          "top 88%"
        );

        // 3. Stat counters — scale bounce
        reveal(
          ".stat-reveal",
          { opacity: 0, scale: 0.88, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.6)" },
          0.08,
          "top 88%"
        );

        // 4. Skill cards — slide from right
        reveal(
          ".skill-card",
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          0.07,
          "top 88%"
        );

        // 5. Project cards — fade + scale up
        reveal(
          ".project-card",
          { opacity: 0, y: 44, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power3.out" },
          0.12,
          "top 85%"
        );

        // 6. Log lines — cascade left
        reveal(
          ".log-line",
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.32, ease: "power1.out" },
          0.055,
          "top 93%"
        );

      });
    }, 120);

    return () => {
      clearTimeout(timer);
      ctx.current?.revert();
    };
  }, []);

  return null;
}
