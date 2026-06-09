"use client";
import { motion } from "framer-motion";

export default function ScrollHint() {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <span className="font-mono text-xs text-white/30 tracking-widest">SCROLL</span>
      <div className="w-px h-12 bg-gradient-to-b from-[#7dcfff]/60 to-transparent relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-4"
          style={{ background: "#7dcfff" }}
          animate={{ y: ["-100%", "300%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
