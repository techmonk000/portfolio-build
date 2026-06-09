"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: "cyan" | "magenta" | "green";
  decimals?: number;
}

const colorMap = {
  cyan: "#00D4FF",
  magenta: "#FF2D78",
  green: "#39FF14",
};

export default function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  color = "cyan",
  decimals = 0,
}: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  const hex = colorMap[color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className="text-4xl font-bold font-mono tabular-nums"
        style={{ color: hex, textShadow: `0 0 20px ${hex}88` }}
      >
        {prefix}{count.toFixed(decimals)}{suffix}
      </div>
      <div className="text-xs text-white/50 text-center font-mono uppercase tracking-widest max-w-[120px]">
        {label}
      </div>
    </motion.div>
  );
}
