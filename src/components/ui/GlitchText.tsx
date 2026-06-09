"use client";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export default function GlitchText({ text, className, as: Tag = "h1" }: GlitchTextProps) {
  return (
    <>
      <Tag
        className={cn("relative inline-block font-bold select-none", className)}
        data-text={text}
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {text}
      </Tag>
      <style>{`
        [data-text="${text}"] {
          animation: glitch 5s infinite;
        }
        [data-text="${text}"]::before,
        [data-text="${text}"]::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        [data-text="${text}"]::before {
          color: #FF2D78;
          animation: glitch-top 5s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
        }
        [data-text="${text}"]::after {
          color: #00D4FF;
          animation: glitch-bottom 5s infinite;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
        }
        @keyframes glitch {
          0%, 88%, 100% { transform: translate(0); }
          90% { transform: translate(-2px, 1px); }
          92% { transform: translate(2px, -1px); }
          94% { transform: translate(-1px, 2px); }
        }
        @keyframes glitch-top {
          0%, 88%, 100% { transform: translate(0); opacity: 0; }
          90% { transform: translate(-3px, -2px); opacity: 0.8; }
          92% { transform: translate(3px, 0); opacity: 0.6; }
          94% { transform: translate(-2px, 1px); opacity: 0.4; }
        }
        @keyframes glitch-bottom {
          0%, 88%, 100% { transform: translate(0); opacity: 0; }
          91% { transform: translate(3px, 2px); opacity: 0.8; }
          93% { transform: translate(-2px, 0); opacity: 0.6; }
          95% { transform: translate(2px, -1px); opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
