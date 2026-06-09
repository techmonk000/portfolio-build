"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import HolographicPanel from "@/components/ui/HolographicPanel";
import ScrollHint from "@/components/ui/ScrollHint";

const NebionArch = dynamic(() => import("@/components/three/NebionArch"), { ssr: false });
const CyberOSArch = dynamic(() => import("@/components/three/CyberOSArch"), { ssr: false });

const PROJECTS = [
  {
    id: "nebion",
    title: "Nebion",
    subtitle: "GPU Hypervisor Engine",
    stack: ["Rust", "CUDA", "C++", "PTX"],
    color: "#00D4FF" as const,
    glowColor: "cyan" as const,
    github: "https://github.com/techmonk000/nebion-engine",
    tagline: "Multi-tenant LLM inference server. Runs Qwen-70B on a single H100.",
    bullets: [
      "Hand-written CUDA kernels: GEMM, flash attention, paged KV decode",
      "OpenAI-compatible HTTP surface via Axum + Tokio",
      "4-tier adaptive quantization (FP16/FP8 E4M3/INT8/INT4) with attention-mass EMA solver",
      "3-tier KV cache fabric: HBM → Pinned Host RAM → NVMe",
      "SLA-aware admission with mid-flight P0–P3 preemption",
      "2-3× more concurrent users on Qwen-7B / H100",
    ],
    metrics: [
      { val: "3×", label: "Concurrent users" },
      { val: "70B", label: "Params on H100" },
      { val: "FP8", label: "Min quantization" },
    ],
    Scene: NebionArch,
    sceneLabel: "Nebion Architecture",
  },
  {
    id: "cyberos",
    title: "Cyber-OS",
    subtitle: "AI-Kernel Security Subsystem",
    stack: ["Rust", "WHPX", "x86_64 ASM", "C++"],
    color: "#FF2D78" as const,
    glowColor: "magenta" as const,
    github: "https://github.com/techmonk000/edith",
    tagline: "Ring-0 OS kernel with in-kernel ML malware classification.",
    bullets: [
      "Rust WHPX VMM + ~5K-line no-std x86_64 kernel",
      "Own GDT/IDT/TSS/4-level paging with NX, preemptive scheduler",
      "SYSCALL/SYSRET — full ring-0 stack, sub-µs interrupt handling at 100 Hz",
      "In-kernel 9-stump gradient-boosted malware classifier (sub-µs inference)",
      "MalConv2 CNN + LightGBM-ABI with Authenticode + reputation filtering",
      "Cut false positives 96%: 1,198 → 50 on a 22,000-file scan",
    ],
    metrics: [
      { val: "96%", label: "FP reduction" },
      { val: "22K", label: "Files scanned" },
      { val: "<1µs", label: "Interrupt latency" },
    ],
    Scene: CyberOSArch,
    sceneLabel: "Ring-0 → Ring-3 Architecture",
  },
];

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { Scene } = project;

  return (
    <div className="project-card">
      <div
        className="relative rounded-sm border backdrop-blur-xl bg-[#0A0F1E]/80 overflow-hidden group cursor-pointer"
        style={{ borderColor: `${project.color}30` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <span
            key={pos}
            className="absolute w-4 h-4 pointer-events-none transition-all duration-300"
            style={{
              top: pos.startsWith("t") ? 0 : "auto",
              bottom: pos.startsWith("b") ? 0 : "auto",
              left: pos.endsWith("l") ? 0 : "auto",
              right: pos.endsWith("r") ? 0 : "auto",
              borderTop: pos.startsWith("t") ? `2px solid ${project.color}` : undefined,
              borderBottom: pos.startsWith("b") ? `2px solid ${project.color}` : undefined,
              borderLeft: pos.endsWith("l") ? `2px solid ${project.color}` : undefined,
              borderRight: pos.endsWith("r") ? `2px solid ${project.color}` : undefined,
              width: hovered ? "24px" : "16px",
              height: hovered ? "24px" : "16px",
            }}
          />
        ))}

        <div className="grid md:grid-cols-2 gap-0">
          {/* 3D Scene panel — data-speed=auto keeps WebGL out of ScrollSmoother transform */}
          <div className="relative h-80 md:h-full min-h-105 border-b md:border-b-0 md:border-r" style={{ borderColor: `${project.color}20` }}>
            <div className="absolute inset-0" data-speed="auto">
              <Scene />
            </div>
            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)",
              }}
            />
          </div>

          {/* Text content */}
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-xs tracking-widest mb-1" style={{ color: `${project.color}80` }}>
                  PROJECT_{String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                <div className="text-sm font-mono" style={{ color: project.color }}>{project.subtitle}</div>
              </div>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs px-3 py-1 border transition-all duration-200 mt-1"
                style={{
                  color: project.color,
                  borderColor: `${project.color}40`,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor = `${project.color}15`;
                  (e.target as HTMLAnchorElement).style.borderColor = project.color;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor = "transparent";
                  (e.target as HTMLAnchorElement).style.borderColor = `${project.color}40`;
                }}
              >
                  GITHUB
              </a>
            </div>

            {/* Stack chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="font-mono text-xs px-2 py-0.5 rounded-sm"
                  style={{
                    color: project.color,
                    backgroundColor: `${project.color}10`,
                    border: `1px solid ${project.color}30`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Tagline */}
            <p className="font-prose text-white/60 text-sm mb-4 leading-relaxed">{project.tagline}</p>

            {/* Bullets */}
            <ul className="space-y-1.5 mb-6">
              {project.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                  <span className="shrink-0 mt-0.5 font-mono" style={{ color: project.color }}>›</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: `${project.color}15` }}>
              {project.metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: project.color }}>{m.val}</div>
                  <div className="font-mono text-xs text-white/30">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 section-heading">
          <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-2">{"// SECTION_02"}</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            PROJECTS<span className="text-[#00D4FF]">.</span>
          </h2>
          <div className="mt-3 h-px w-24 bg-gradient-to-r from-[#00D4FF] to-transparent" />
        </div>

        {/* Project cards */}
        <div className="space-y-10">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
        <ScrollHint />
      </div>
    </section>
  );
}
