"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import TerminalText from "@/components/ui/TerminalText";
import StatCounter from "@/components/ui/StatCounter";
import HolographicPanel from "@/components/ui/HolographicPanel";
import ScrollHint from "@/components/ui/ScrollHint";

const TERMINAL_LINES = [
  "whoami",
  "→ Swarnavo Mukherjee // Systems Engineer",
  "cat bio.txt",
  "→ Building high-performance LLM inference systems",
  "→ Writing CUDA kernels close to the bare metal",
  "→ Designed GPU hypervisors, OS kernels, and ML pipelines",
  "→ Working on Nebion: a multi-tenant LLM server in Rust",
  "uname -a",
  "→ CUDA · Rust · PTX · WMMA · Tokio · x86_64 ring-0",
  "location",
  "→ Kolkata, India",
];

const STATS = [
  { value: 96, suffix: "%", label: "False Positive Reduction (Cyber-OS)", color: "magenta" as const },
  { value: 3, suffix: "×", label: "Concurrent Users (Nebion H100)", color: "cyan" as const, decimals: 1 },
  { value: 60, suffix: "%", label: "Report Time Reduced (Alliance)", color: "green" as const },
  { value: 5000, suffix: "+", label: "Lines of no-std kernel code", color: "cyan" as const },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 px-6 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16 section-heading">
          <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-2">{"// SECTION_01"}</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            PROFILE<span className="text-[#00D4FF]">.</span>
          </h2>
          <div className="mt-3 h-px w-24 bg-gradient-to-r from-[#00D4FF] to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left: Profile photo + terminal */}
          <div className="space-y-6">
            <HolographicPanel className="p-1 overflow-hidden" delay={0.1}>
              <div className="flex flex-col sm:flex-row sm:h-120">
                {/* Photo */}
                <div className="relative w-full sm:w-[58%] shrink-0 overflow-hidden h-96 sm:h-auto">
                  <Image
                    src="/assets/profile_photo.jpg"
                    alt="Swarnavo Mukherjee"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020408]/80 via-transparent to-transparent" />
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.08) 2px, rgba(0,212,255,0.08) 4px)",
                    }}
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-mono text-xs text-[#00D4FF] tracking-widest mb-1">IDENTITY_CONFIRMED</div>
                    <div className="font-bold text-white text-lg">Swarnavo Mukherjee</div>
                    <div className="font-mono text-xs text-white/50">Kolkata, India · techmonk000</div>
                  </div>
                </div>

                {/* Access card */}
                <div className="flex-1 flex flex-col justify-between px-4 py-5 border-t sm:border-t-0 sm:border-l border-[#00D4FF]/15 bg-[#020408]/60">
                  {/* Top: access granted */}
                  <div>
                    <div className="font-mono text-[10px] text-white/50 tracking-widest mb-3">SYS_AUTH · v2.0</div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="font-mono text-xs font-bold tracking-widest text-[#39FF14] mb-1"
                    >
                      ● ACCESS_GRANTED
                    </motion.div>
                    <div className="h-px w-full bg-[#39FF14]/20 mb-4" />
                    <div className="space-y-2">
                      {[
                        { label: "HANDLE", val: "techmonk000" },
                        { label: "CLEARANCE", val: "RING-0" },
                        { label: "ARCH", val: "x86_64" },
                        { label: "PRIMARY", val: "Rust / CUDA" },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <div className="font-mono text-[9px] text-white/50 tracking-widest">{label}</div>
                          <div className="font-mono text-xs text-[#00D4FF]/80">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Middle: threat scan */}
                  <div>
                    <div className="font-mono text-[9px] text-white/50 tracking-widest mb-2">THREAT_SCAN</div>
                    <div className="space-y-1.5">
                      {[
                        { label: "MALWARE", status: "CLEAN" },
                        { label: "INTRUSION", status: "BLOCKED" },
                        { label: "ANOMALY", status: "0 FOUND" },
                      ].map(({ label, status }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-white/60">{label}</span>
                          <span className="font-mono text-[9px] text-[#39FF14]">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: kernel status */}
                  <div>
                    <div className="font-mono text-[9px] text-white/50 tracking-widest mb-2">KERNEL_STATUS</div>
                    <div className="space-y-1">
                      {[
                        { label: "NEBION", val: "RUNNING", color: "#00D4FF" },
                        { label: "CYBER-OS", val: "ARMED", color: "#FF2D78" },
                        { label: "CUDA", val: "sm_89", color: "#AA88FF" },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-white/60">{label}</span>
                          <span className="font-mono text-[9px] font-bold" style={{ color }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 font-mono text-[9px] text-white/40 leading-relaxed">
                      UID · 0x4E4542494F4E<br />
                      SESSION · ENCRYPTED
                    </div>
                  </div>
                </div>
              </div>
            </HolographicPanel>

            {/* Terminal */}
            <HolographicPanel className="p-5" delay={0.2} glowColor="green">
              <div className="font-mono text-xs text-[#39FF14]/50 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2D78]" />
                <span className="w-2 h-2 rounded-full bg-[#FFAA00]" />
                <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
                <span className="ml-2">swarnavo@nebion:~</span>
              </div>
              <TerminalText lines={TERMINAL_LINES} typingSpeed={25} />
            </HolographicPanel>
          </div>

          {/* Right: Stats + description */}
          <div className="space-y-8">
            {/* Stats grid */}
            <HolographicPanel className="p-8" delay={0.15}>
              <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-6">PERFORMANCE_METRICS</div>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                {STATS.map((s) => (
                  <div key={s.label} className="stat-reveal">
                    <StatCounter {...s} />
                  </div>
                ))}
              </div>
            </HolographicPanel>
            <br />
            <br />
            {/* Bio text */}
            <HolographicPanel className="p-8" delay={0.3}>
              <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-4">BIO</div>
              <p className="font-prose text-white/70 leading-relaxed text-sm mb-4">
                I build software that operates at the intersection of hardware and intelligence. My work spans
                hand-written CUDA kernels for flash attention, a multi-tenant GPU hypervisor that breaks the
                HBM concurrent-user ceiling, and a ring-0 OS kernel with in-kernel malware classification.
              </p>
              <p className="font-prose text-white/70 leading-relaxed text-sm mb-6">
                With my previous experience of building core systems for my company, I write software that
                <span className="text-[#7dcfff]"> is</span> scalable and sits at the hardware layer — schedulers, memory managers,
                interrupt handlers, and tensor-core GEMM kernels.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Rust", "C++/CUDA", "Python", "TypeScript",
                  "PTX inline ASM", "Tokio async", "Next.js", "Docker"
                ].map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-xs px-2 py-1 bg-[#00D4FF]/5 border border-[#00D4FF]/20 text-[#00D4FF]/70 rounded-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </HolographicPanel>
    

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              <a
                href="https://github.com/techmonk000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 font-mono text-sm text-center py-3 border border-[#00D4FF]/30 text-[#00D4FF]/80 hover:border-[#00D4FF] hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-all"
              >
                  GITHUB 
              </a>
              <a
                href="https://www.linkedin.com/in/swarnavo-mukherjee-9a1192263/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 font-mono text-sm text-center py-3 border border-[#FF2D78]/30 text-[#FF2D78]/80 hover:border-[#FF2D78] hover:text-[#FF2D78] hover:bg-[#FF2D78]/5 transition-all"
              >
                  LINKEDIN 
              </a>
            </motion.div>
          </div>
        </div>
        <ScrollHint />
      </div>
    </section>
  );
}
