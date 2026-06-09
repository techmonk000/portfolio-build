"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "#hero", label: "SYS_INIT" },
  { href: "#about", label: "PROFILE" },
  { href: "#projects", label: "PROJECTS" },
  { href: "#skills", label: "SKILLS" },
  { href: "#experience", label: "EXP_LOG" },
  { href: "#contact", label: "CONNECT" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    LINKS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020408]/90 backdrop-blur-xl border-b border-[#00D4FF]/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="font-mono text-[#00D4FF] text-sm font-bold tracking-widest text-glow-cyan">
          SWARNAVO.SYS
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(({ href, label }) => {
            const id = href.slice(1);
            return (
              <a
                key={href}
                href={href}
                className={`font-mono text-xs tracking-widest transition-all duration-200 ${
                  active === id
                    ? "text-[#00D4FF] text-glow-cyan"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden font-mono text-[#00D4FF] text-xs"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "[CLOSE]" : "[MENU]"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#020408]/95 border-b border-[#00D4FF]/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="font-mono text-xs tracking-widest text-white/60 hover:text-[#00D4FF] transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
