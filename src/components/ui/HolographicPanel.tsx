"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HolographicPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "magenta" | "green";
  animate?: boolean;
  delay?: number;
}

const glowMap = {
  cyan: "border-[#00D4FF]/30 shadow-[0_0_20px_rgba(0,212,255,0.1)]",
  magenta: "border-[#FF2D78]/30 shadow-[0_0_20px_rgba(255,45,120,0.1)]",
  green: "border-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.1)]",
};

const cornerMap = {
  cyan: "before:border-[#00D4FF] after:border-[#00D4FF]",
  magenta: "before:border-[#FF2D78] after:border-[#FF2D78]",
  green: "before:border-[#39FF14] after:border-[#39FF14]",
};

export default function HolographicPanel({
  children,
  className,
  glowColor = "cyan",
  animate = true,
  delay = 0,
}: HolographicPanelProps) {
  const base = (
    <div
      className={cn(
        "relative rounded-sm border backdrop-blur-xl bg-[#0A0F1E]/80 scanlines",
        glowMap[glowColor],
        className
      )}
    >
      {/* Top-left corner bracket */}
      <span
        className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
        style={{
          borderTop: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
          borderLeft: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
        }}
      />
      {/* Bottom-right corner bracket */}
      <span
        className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          borderBottom: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
          borderRight: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
        }}
      />
      {/* Top-right corner bracket */}
      <span
        className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          borderTop: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
          borderRight: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
        }}
      />
      {/* Bottom-left corner bracket */}
      <span
        className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none"
        style={{
          borderBottom: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
          borderLeft: `2px solid var(--${glowColor === "cyan" ? "cuda-cyan" : glowColor === "magenta" ? "threat-magenta" : "terminal-green"})`,
        }}
      />
      {children}
    </div>
  );

  if (!animate) return base;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {base}
    </motion.div>
  );
}
