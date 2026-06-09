"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import HolographicPanel from "@/components/ui/HolographicPanel";

const COMMANDS = [
  { cmd: "whoami", output: "Swarnavo Mukherjee // GPU Systems · LLM Inference · CUDA" },
  { cmd: "cat location.txt", output: "Kolkata, India · Open to remote worldwide" },
  { cmd: "cat availability.txt", output: "Open to: Full-time · Contract · Research Collabs" },
  { cmd: "echo $EMAIL", output: "swarnavomukherjee03@gmail.com" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 font-mono text-xs px-2 py-0.5 border border-[#00D4FF]/30 text-[#00D4FF]/60 hover:text-[#00D4FF] hover:border-[#00D4FF] transition-all"
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="relative py-24 px-6 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00D4FF]/5 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="font-mono text-xs text-[#00D4FF]/50 tracking-widest mb-2">{"// SECTION_05"}</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            CONNECT<span className="text-[#00D4FF]">.</span>
          </h2>
          <div className="mt-3 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
          <p className="mt-6 text-white/50 font-mono text-sm">
            Building something at the intersection of hardware and intelligence?<br />
            Let&apos;s talk.
          </p>
        </motion.div>

        {/* Terminal block */}
        <HolographicPanel className="p-6 mb-6" delay={0.15} glowColor="green">
          <div className="font-mono text-xs text-[#39FF14]/40 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF2D78]" />
            <span className="w-2 h-2 rounded-full bg-[#FFAA00]" />
            <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
            <span className="ml-2">swarnavo@nebion:~ — contact.sh</span>
          </div>

          <div className="space-y-4">
            {COMMANDS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#00D4FF] font-mono text-sm">$</span>
                  <span className="text-[#39FF14] font-mono text-sm">{item.cmd}</span>
                </div>
                <div className="flex items-start ml-4 flex-wrap gap-1">
                  <span className="text-white/60 font-mono text-xs sm:text-sm wrap-break-word">{item.output}</span>
                  {item.cmd.includes("EMAIL") && (
                    <CopyButton text="swarnavomukherjee03@gmail.com" />
                  )}
                </div>
              </motion.div>
            ))}

            {/* Blinking cursor */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#00D4FF] font-mono text-sm">$</span>
              <span className="inline-block w-2 h-4 bg-[#39FF14] animate-pulse" />
            </div>
          </div>
        </HolographicPanel>

        {/* Link buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <a
            href="mailto:swarnavomukherjee03@gmail.com"
            className="group flex flex-col items-center gap-2 py-5 border border-[#00D4FF]/20 hover:border-[#00D4FF] hover:bg-[#00D4FF]/5 transition-all text-center"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            <span className="font-mono text-xs text-[#00D4FF]/50 group-hover:text-[#00D4FF] transition-colors">EMAIL</span>
            <span className="font-mono text-[10px] text-white/50 group-hover:text-white/80 transition-colors wrap-break-word text-center px-2 leading-relaxed">
              swarnavomukherjee03@gmail.com
            </span>
          </a>
          <a
            href="https://github.com/techmonk000"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 py-5 border border-[#39FF14]/20 hover:border-[#39FF14] hover:bg-[#39FF14]/5 transition-all"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            <span className="font-mono text-xs text-[#39FF14]/50 group-hover:text-[#39FF14] transition-colors">GITHUB</span>
            <span className="font-mono text-xs text-white/50 group-hover:text-white/80 transition-colors">techmonk000</span>
          </a>
          <a
            href="https://www.linkedin.com/in/swarnavo-mukherjee-9a1192263/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 py-5 border border-[#FF2D78]/20 hover:border-[#FF2D78] hover:bg-[#FF2D78]/5 transition-all"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            <span className="font-mono text-xs text-[#FF2D78]/50 group-hover:text-[#FF2D78] transition-colors">LINKEDIN</span>
            <span className="font-mono text-xs text-white/50 group-hover:text-white/80 transition-colors">swarnavo-mukherjee</span>
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <div className="font-mono text-xs text-white/15">
          SWARNAVO.SYS v2.0.0 
        </div>
      </motion.div>
    </section>
  );
}
