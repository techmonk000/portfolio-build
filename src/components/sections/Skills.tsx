"use client";
import { motion } from "framer-motion";
import HolographicPanel from "@/components/ui/HolographicPanel";
import KernelCodePanel from "@/components/ui/KernelCodePanel";
import ScrollHint from "@/components/ui/ScrollHint";

const CLUSTERS = [
  {
    name: "GPU / CUDA",
    color: "#00D4FF",
    skills: ["CUDA", "PTX inline ASM", "WMMA Tensor-Core", "Flash Attention Kernels", "Paged KV Decode"],
  },
  {
    name: "Systems",
    color: "#FF6B35",
    skills: ["Rust", "C++", "Tokio async runtime", "x86_64 Ring-0", "WHPX VMM", "no-std kernel"],
  },
  {
    name: "ML / Research",
    color: "#AA88FF",
    skills: ["PyTorch", "safe-tensors", "KV Compression", "Quantization (FP8/INT8/INT4)", "LightGBM"],
  },
  {
    name: "Backend",
    color: "#39FF14",
    skills: ["Axum + Tower", "Next.js App Router", "Node.js", "Postgres", "Docker", "Clerk", "REST"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="relative py-24 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4FF]/2 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 section-heading">
          <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-2">{"// SECTION_03"}</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            SKILLS<span className="text-[#00D4FF]">.</span>
          </h2>
          <div className="mt-3 h-px w-24 bg-gradient-to-r from-[#00D4FF] to-transparent" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono text-xs text-white/30 mb-12"
        >
          {"// gemm_fp16.cu — scroll to explore the kernel"}
        </motion.p>

        {/* IDE panel — full width on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="h-72 sm:h-96 md:h-131 flex flex-col mb-6"
        >
          <HolographicPanel className="overflow-hidden h-full flex flex-col" animate={false}>
            <KernelCodePanel className="flex-1 min-h-0" />
          </HolographicPanel>
        </motion.div>

        {/* Skill clusters — 2-col grid on mobile, 4-col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CLUSTERS.map((cluster, i) => (
            <HolographicPanel
              key={cluster.name}
              className="p-4 skill-card"
              delay={i * 0.1}
              glowColor={cluster.color === "#00D4FF" ? "cyan" : cluster.color === "#39FF14" ? "green" : "magenta"}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cluster.color }} />
                <span className="font-mono text-xs font-bold tracking-widest" style={{ color: cluster.color }}>
                  {cluster.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cluster.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm text-white/60 hover:text-white/90 transition-colors cursor-default"
                    style={{
                      backgroundColor: `${cluster.color}08`,
                      border: `1px solid ${cluster.color}25`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </HolographicPanel>
          ))}
        </div>
        <ScrollHint />
      </div>
    </section>
  );
}
