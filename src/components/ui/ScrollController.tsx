"use client";
import { useEffect, useRef, useCallback } from "react";

const SECTION_IDS = ["hero", "about", "projects", "skills", "experience", "contact"];
const LABELS: Record<string, string> = {
  hero:       "SYS_INIT",
  about:      "PROFILE",
  projects:   "PROJECTS",
  skills:     "SKILLS",
  experience: "EXP_LOG",
  contact:    "CONNECT",
};

const WIPE_DURATION = 420;
const EASE_DURATION = 580;
const THRESHOLD     = 60;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ScrollController() {
  const currentIdx  = useRef(0);
  const busy        = useRef(false);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);

  const getSectionTop = useCallback((idx: number) => {
    const el = document.getElementById(SECTION_IDS[idx]);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }, []);

  const syncIdx = useCallback(() => {
    let best = 0, bestDist = Infinity;
    SECTION_IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dist = Math.abs(el.getBoundingClientRect().top);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    currentIdx.current = best;
  }, []);

  const sectionHasMore = useCallback((dir: "down" | "up") => {
    const el = document.getElementById(SECTION_IDS[currentIdx.current]);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return dir === "down"
      ? rect.bottom > window.innerHeight + THRESHOLD
      : rect.top < -THRESHOLD;
  }, []);

  const fireWipe = useCallback((dir: "down" | "up", nextIdx: number) => {
    const el = scanlineRef.current;
    const lb = labelRef.current;
    if (!el) return;

    el.style.transition = "none";
    el.style.top = dir === "down" ? "-3px" : "calc(100% + 3px)";
    el.style.opacity = "1";
    void el.offsetHeight;

    el.style.transition = `top ${WIPE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
    el.style.top = dir === "down" ? "calc(100% + 3px)" : "-3px";

    if (lb) {
      lb.style.opacity = "0";
      lb.style.transform = "translateX(-8px)";
      setTimeout(() => {
        lb.textContent = `// ${LABELS[SECTION_IDS[nextIdx]]}`;
        lb.style.transition = "opacity 0.3s, transform 0.3s";
        lb.style.opacity = "1";
        lb.style.transform = "translateX(0)";
      }, WIPE_DURATION * 0.55);
    }
  }, []);

  const easeScroll = useCallback((targetY: number) => {
    const startY = window.scrollY;
    const diff   = targetY - startY;
    const start  = performance.now();
    cancelAnimationFrame(rafRef.current);

    function step(now: number) {
      const t = Math.min((now - start) / EASE_DURATION, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(t));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else { window.scrollTo(0, targetY); busy.current = false; syncIdx(); }
    }
    rafRef.current = requestAnimationFrame(step);
  }, [syncIdx]);

  const navigate = useCallback((dir: "down" | "up") => {
    if (busy.current) return;
    if (sectionHasMore(dir)) return;

    const nextIdx = dir === "down"
      ? Math.min(currentIdx.current + 1, SECTION_IDS.length - 1)
      : Math.max(currentIdx.current - 1, 0);
    if (nextIdx === currentIdx.current) return;

    busy.current = true;
    currentIdx.current = nextIdx;

    fireWipe(dir, nextIdx);
    setTimeout(() => easeScroll(getSectionTop(nextIdx)), WIPE_DURATION * 0.25);
  }, [sectionHasMore, fireWipe, easeScroll, getSectionTop]);

  useEffect(() => {
    syncIdx();

    let wheelAcc = 0;
    let wheelTimer: ReturnType<typeof setTimeout>;

    // ScrollSmoother owns the scroll feel — we only watch for section boundaries
    const onWheel = (e: WheelEvent) => {
      if (sectionHasMore(e.deltaY > 0 ? "down" : "up")) { wheelAcc = 0; return; }
      // don't preventDefault — ScrollSmoother handles inertia
      if (busy.current) return;
      wheelAcc += e.deltaY;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelAcc = 0; }, 100);
      if (Math.abs(wheelAcc) > 30) { navigate(wheelAcc > 0 ? "down" : "up"); wheelAcc = 0; }
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const d = touchY - e.changedTouches[0].clientY;
      if (Math.abs(d) > 50) navigate(d > 0 ? "down" : "up");
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown","PageDown"].includes(e.key)) { e.preventDefault(); navigate("down"); }
      if (["ArrowUp","PageUp"].includes(e.key))     { e.preventDefault(); navigate("up"); }
    };

    const onScrollEnd = () => { if (!busy.current) syncIdx(); };

    window.addEventListener("wheel",      onWheel,      { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    window.addEventListener("keydown",    onKey);
    window.addEventListener("scrollend",  onScrollEnd,  { passive: true });

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("scrollend",  onScrollEnd);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(wheelTimer);
    };
  }, [navigate, syncIdx, sectionHasMore]);

  return (
    <>
      {/* Scanline sweep */}
      <div
        ref={scanlineRef}
        style={{
          position: "fixed",
          left: 0,
          top: "-3px",
          width: "100%",
          height: "3px",
          background: "linear-gradient(90deg, transparent 0%, #7dcfff 20%, #bb9af7 50%, #9ece6a 80%, transparent 100%)",
          boxShadow: "0 0 18px 4px rgba(125,207,255,0.55), 0 0 40px 10px rgba(187,154,247,0.25)",
          opacity: 0,
          zIndex: 9998,
          pointerEvents: "none",
          willChange: "top",
        }}
      />

      {/* Section label — bottom left */}
      <div
        ref={labelRef}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: "rgba(125,207,255,0.5)",
          zIndex: 9997,
          pointerEvents: "none",
          transition: "opacity 0.3s, transform 0.3s",
        }}
      >
        // SYS_INIT
      </div>
    </>
  );
}
