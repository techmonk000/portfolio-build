"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TerminalTextProps {
  lines: string[];
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
  prompt?: string;
}

export default function TerminalText({
  lines,
  className,
  typingSpeed = 35,
  startDelay = 200,
  prompt = "$ ",
}: TerminalTextProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];

    if (currentChar <= line.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, currentChar === 0 ? startDelay : typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [started, currentLine, currentChar, lines, typingSpeed, startDelay]);

  return (
    <div ref={ref} className={cn("font-mono text-sm leading-relaxed", className)}>
      {lines.map((line, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-[#00D4FF] shrink-0 select-none">{prompt}</span>
          <span className="text-[#39FF14]">
            {displayedLines[i] ?? ""}
            {i === currentLine && started && currentLine < lines.length && (
              <span className="inline-block w-2 h-4 bg-[#39FF14] ml-0.5 animate-pulse" />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
