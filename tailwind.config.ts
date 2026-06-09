import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d1117",
        "cuda-cyan": "#7dcfff",
        "threat-magenta": "#bb9af7",
        "terminal-green": "#9ece6a",
        "panel-dark": "#13161e",
        "panel-border": "#1e2a3a",
        "dim-blue": "#1a1b26",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        prose: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "scan-line": "scanLine 3s linear infinite",
        "flicker": "flicker 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.4" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.6" },
          "97%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px #00D4FF, 0 0 10px #00D4FF33" },
          "50%": { boxShadow: "0 0 15px #00D4FF, 0 0 30px #00D4FF66" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
