"use client";
import { motion } from "framer-motion";
import HolographicPanel from "@/components/ui/HolographicPanel";
import ScrollHint from "@/components/ui/ScrollHint";


const LOG_ENTRIES = [
  { time: "05/2025", level: "INFO", process: "CAREER", message: "Joined Alliance Australia Property Pvt. Ltd as Software Engineer" },
  { time: "05/2025", level: "INIT", process: "SYSTEM", message: "Bootstrapped LLM pipeline for AI-based property valuation reports" },
  { time: "06/2025", level: "PERF", process: "PIPELINE", message: "Data ingestion + automation → 60% reduction in manual report time" },
  { time: "07/2025", level: "KERNEL", process: "SEC_SUBSYS", message: "Architected handwritten x86_64 kernel — detected 4+ critical vulnerabilities" },
  { time: "08/2025", level: "PERF", process: "SEC_SUBSYS", message: "System security hardened by 40% via kernel-level threat isolation" },
  { time: "09/2025", level: "REVENUE", process: "METRICS", message: "Software generated 100 leads — company hit $10K MRR milestone" },
  { time: "04/2026", level: "EXIT", process: "CAREER", message: "Role completed — full-cycle: infra engineer → kernel author → revenue driver" },
];

const LEVEL_COLORS: Record<string, string> = {
  INFO: "#00D4FF",
  INIT: "#39FF14",
  PERF: "#AA88FF",
  KERNEL: "#FF6B35",
  SEC_SUBSYS: "#FF2D78",
  REVENUE: "#39FF14",
  EXIT: "#FFAA00",

};

function DmesgLine({ entry }: { entry: typeof LOG_ENTRIES[0] }) {
  return (
    <div className="log-line flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b border-white/5 hover:bg-white/2 transition-colors group">
      {/* Top row on mobile: timestamp + level badge */}
      <div className="flex items-center gap-2 sm:contents">
        <span className="font-mono text-xs text-white/25 shrink-0 sm:w-16">[{entry.time}]</span>
        <span
          className="font-mono text-xs font-bold shrink-0 sm:w-16 text-center px-1"
          style={{
            color: LEVEL_COLORS[entry.level] ?? "#ffffff",
            backgroundColor: `${LEVEL_COLORS[entry.level] ?? "#ffffff"}15`,
            border: `1px solid ${LEVEL_COLORS[entry.level] ?? "#ffffff"}30`,
          }}
        >
          {entry.level}
        </span>
        <span className="font-mono text-xs text-[#00D4FF]/50 shrink-0 sm:w-20 hidden sm:inline">{entry.process}</span>
      </div>
      <span className="font-mono text-xs text-white/70 group-hover:text-white/90 transition-colors pl-0 sm:pl-0">{entry.message}</span>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 section-heading">
          <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-2">{"// SECTION_04"}</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            EXP_LOG<span className="text-[#00D4FF]">.</span>
          </h2>
          <div className="mt-3 h-px w-24 bg-linear-to-r from-[#00D4FF] to-transparent" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main experience block */}
          <div className="md:col-span-2 space-y-6">

            {/* JP Morgan — upcoming */}
            <HolographicPanel className="p-6" delay={0.05} glowColor="cyan">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-1">POSITION_01</div>
                  <h3 className="text-xl font-bold text-white mb-1">Software Engineer</h3>
                  <div className="font-mono text-sm text-[#00D4FF]">J.P. Morgan Chase &amp; Co.</div>
                  <div className="font-mono text-xs text-white/30 mt-1">August 2026 · Upcoming</div>
                </div>
                <div className="font-mono text-xs px-3 py-1 border border-[#00D4FF]/40 text-[#00D4FF] bg-[#00D4FF]/5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                  UPCOMING
                </div>
              </div>
            </HolographicPanel>

            {/* Alliance Australia — completed */}
            <HolographicPanel className="p-6 pb-8" delay={0.1}>
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#00D4FF]/10">
                <div>
                  <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-1">POSITION_02</div>
                  <h3 className="text-xl font-bold text-white mb-1">Software Engineer</h3>
                  <div className="font-mono text-sm text-[#00D4FF]">Alliance Australia Property Pvt. Ltd</div>
                  <div className="font-mono text-xs text-white/30 mt-1">May 2025 — April 2026 · Kolkata, India</div>
                </div>
                <div className="font-mono text-xs px-3 py-1 border border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5">
                  COMPLETED
                </div>
              </div>

              <div className="font-mono text-xs text-[#00D4FF]/40 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                dmesg | grep -i &quot;alliance&quot;
              </div>
              <div className="space-y-0">
                {LOG_ENTRIES.map((entry, i) => (
                  <DmesgLine key={i} entry={entry} />
                ))}
              </div>
            </HolographicPanel>

          </div>

          {/* Education + timeline sidebar */}
          <div className="space-y-6">
            {/* Education */}
            <HolographicPanel className="p-6" delay={0.2} glowColor="green">
              <div className="font-mono text-xs text-[#39FF14]/50 tracking-widest mb-4">EDUCATION</div>
              <div>
                <div className="font-bold text-white mb-1">B.Tech Computer Science</div>
                <div className="font-mono text-sm text-[#39FF14]">University of Engineering & Management</div>
                <div className="font-mono text-xs text-white/30 mt-1">Kolkata, India</div>
              </div>
            </HolographicPanel>

            {/* Key achievements */}
            <HolographicPanel className="p-6" delay={0.3}>
              <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-4">KEY_ACHIEVEMENTS</div>
              <div className="space-y-4">
                {[
                  { val: "$10K", label: "MRR Generated", color: "#39FF14" },
                  { val: "100+", label: "Leads via Software", color: "#00D4FF" },
                  { val: "60%", label: "Time Reduction", color: "#AA88FF" },
                  { val: "40%", label: "Security Improvement", color: "#FF2D78" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/50">{item.label}</span>
                    <span className="font-mono font-bold text-sm" style={{ color: item.color }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </HolographicPanel>

            {/* Languages */}
            <HolographicPanel className="p-6" delay={0.4} glowColor="magenta">
              <div className="font-mono text-xs text-[#FF2D78]/50 tracking-widest mb-4">LANGUAGES</div>
              <div className="space-y-2">
                {[
                  { lang: "Rust", level: 95, color: "#FF6B35" },
                  { lang: "C++/CUDA", level: 90, color: "#00D4FF" },
                  { lang: "Python", level: 85, color: "#AA88FF" },
                  { lang: "TypeScript", level: 80, color: "#39FF14" },
                  { lang: "Java", level: 65, color: "#FFAA00" },
                ].map((item) => (
                  <div key={item.lang}>
                    <div className="flex justify-between font-mono text-xs mb-1">
                      <span className="text-white/60">{item.lang}</span>
                      <span style={{ color: item.color }}>{item.level}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </HolographicPanel>
          </div>
        </div>
        <ScrollHint />
      </div>
    </section>
  );
}
