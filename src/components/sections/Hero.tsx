/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const ROLES = [
  "LLM Inference Engineer",
  "CUDA Kernel Author",
  "GPU Hypervisor Builder",
  "Ring-0 Systems Hacker",
  "Distributed Systems Engineer",
];

function TypedRole() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = ROLES[roleIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setRoleIdx((i) => (i + 1) % ROLES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, roleIdx]);

  return (
    <span className="text-[#00D4FF] font-mono">
      {displayed}
      <span className="animate-pulse">_</span>
    </span>
  );
}

export default function Hero() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center">
      {/* Full-bleed 3D canvas — data-speed=auto keeps it out of ScrollSmoother transform */}
      <div className="absolute inset-0 z-0" data-speed="auto">
        <HeroScene />
      </div>

      {/* Dark gradient vignette so text is readable */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020408]/90 via-[#020408]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020408] via-transparent to-transparent pointer-events-none" />

      {/* Hero content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full pt-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl"
        >
          {/* System boot label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-xs text-[#00D4FF]/60 tracking-widest mb-4 flex items-center gap-2"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
            SYSTEM_ONLINE :: PORTFOLIO_v2.0.0
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-none mb-2"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="text-white">Swarnavo</span>
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #00D4FF 0%, #FF2D78 100%)",
              }}
            >
              Mukherjee
            </span>
          </motion.h1>

          {/* Typed roles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-base md:text-2xl font-mono mt-4 mb-6 h-7 md:h-8"
          >
            <TypedRole />
          </motion.div>

          {/* Tag chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {["CUDA", "Rust", "LLM Inference", "GPU Hypervisor", "Ring-0 Kernel"].map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-3 py-1 border border-[#00D4FF]/30 text-[#00D4FF]/80 rounded-sm bg-[#00D4FF]/5 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/60 transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="group relative px-6 py-3 font-mono text-sm font-bold text-[#020408] bg-[#00D4FF] hover:bg-[#00D4FF]/90 transition-all duration-200 clip-path-btn"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
            >
              VIEW_PROJECTS
            </a>
            <a
              href="#contact"
              className="px-6 py-3 font-mono text-sm font-bold text-[#00D4FF] border border-[#00D4FF]/40 hover:border-[#00D4FF] hover:bg-[#00D4FF]/5 transition-all duration-200"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
            >
              CONNECT
            </a>
            <a
              href="https://github.com/techmonk000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 font-mono text-sm font-bold text-white/50 border border-white/10 hover:border-white/30 hover:text-white/80 transition-all duration-200"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
            >
              GITHUB
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-xs text-white/30 tracking-widest">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#00D4FF]/60 to-transparent relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-4 bg-[#00D4FF]"
            animate={{ y: ["-100%", "300%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
