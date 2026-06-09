"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_SEQUENCE = [
  { t: 0,    text: "BIOS v2.0.0 — NEBION SYSTEMS INC.",                       color: "#c0caf5" },
  { t: 160,  text: "CPU: x86_64  ·  ARCH: zen4  ·  HT: ENABLED",             color: "#7dcfff" },
  { t: 320,  text: "RAM: 65536 MB DDR5  ·  ECC: ON  ·  CHANNELS: 4",         color: "#7dcfff" },
  { t: 500,  text: "GPU[0]: H100 SXM5  ·  VRAM: 80 GB HBM3  ·  sm_90",       color: "#bb9af7" },
  { t: 680,  text: "CUDA DRIVER: 12.4  ·  COMPUTE CAPABILITY: 9.0",           color: "#bb9af7" },
  { t: 860,  text: "────────────────────────────────────────────────────────", color: "#1e2a3a" },
  { t: 940,  text: "[ OK ] Loading initramfs...",                              color: "#9ece6a" },
  { t: 1120, text: "[ OK ] Mounting /dev/nvme0n1p1 as /boot",                 color: "#9ece6a" },
  { t: 1300, text: "[ OK ] Starting nebion-kernel v0.9.1 (no-std, ring-0)",   color: "#9ece6a" },
  { t: 1520, text: "[ OK ] Loading CUDA warp scheduler...",                   color: "#9ece6a" },
  { t: 1720, text: "[ OK ] HBM allocator: 6144 MB mapped",                    color: "#9ece6a" },
  { t: 1900, text: "[ OK ] KV-cache paging engine: ONLINE",                   color: "#9ece6a" },
  { t: 2080, text: "[ OK ] Flash-attention kernel: ARMED",                    color: "#9ece6a" },
  { t: 2260, text: "[ OK ] Threat isolation subsystem: ACTIVE",               color: "#9ece6a" },
  { t: 2460, text: "[ WARN ] WMMA tensor cores: experimental path selected",  color: "#e0af68" },
  { t: 2640, text: "[ OK ] Ring-0 malware classifier: LOADED",                color: "#9ece6a" },
  { t: 2820, text: "────────────────────────────────────────────────────────", color: "#1e2a3a" },
  { t: 2960, text: "[ OK ] nebion-cuda FFI bridge: READY",                    color: "#9ece6a" },
  { t: 3140, text: "[ OK ] Tokio async runtime: ONLINE",                      color: "#9ece6a" },
  { t: 3320, text: "[ OK ] Axum HTTP layer: LISTENING on :443",               color: "#9ece6a" },
  { t: 3500, text: "────────────────────────────────────────────────────────", color: "#1e2a3a" },
  { t: 3640, text: "SYSTEM BOOT COMPLETE  ·  PORTFOLIO_v2.0.0",               color: "#7dcfff" },
];

const TOTAL_MS = 4200;
const HOLD_MS  = 500;
const FADE_MS  = 600;

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_SEQUENCE.forEach((line, i) => {
      timers.push(setTimeout(() => setVisible((v) => [...v, i]), line.t));
    });

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (TOTAL_MS / 50);
        return next >= 100 ? 100 : next;
      });
    }, 50);

    timers.push(
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
      }, TOTAL_MS)
    );

    timers.push(
      setTimeout(() => setExiting(true), TOTAL_MS + HOLD_MS)
    );

    timers.push(
      setTimeout(() => onDone(), TOTAL_MS + HOLD_MS + FADE_MS)
    );

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: "#0d1117" }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e2a3a]">
            <span className="font-mono text-[11px] text-[#7dcfff]/60 tracking-widest">NEBION SYSTEMS · BIOS POST</span>
            <span className="font-mono text-[11px] text-white/20 tracking-widest">SWARNAVO.SYS v2.0.0</span>
          </div>

          {/* Log output */}
          <div className="flex-1 px-6 py-6 overflow-hidden flex flex-col justify-start gap-0">
            {BOOT_SEQUENCE.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={visible.includes(i) ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.18 }}
                className="font-mono text-[12px] leading-[1.7]"
                style={{ color: line.color }}
              >
                {line.text}
              </motion.div>
            ))}

            {/* Blinking cursor at end */}
            {visible.length === BOOT_SEQUENCE.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="font-mono text-[12px] text-[#7dcfff] mt-1"
              >
                ▋
              </motion.span>
            )}
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-8 pt-2">
            <div className="flex items-end justify-between mb-3">
              <span className="font-mono text-[11px] text-white/40 tracking-widest">INITIALIZING SYSTEM</span>
              <span
                className="font-mono font-bold text-white"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                {String(Math.round(progress)).padStart(3, "0")}
              </span>
            </div>
            <div className="h-0.75 w-full bg-[#1e2a3a] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #7dcfff, #bb9af7, #9ece6a)",
                  boxShadow: "0 0 10px rgba(125,207,255,0.5)",
                }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
