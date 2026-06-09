"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const BootScreen   = dynamic(() => import("@/components/ui/BootScreen"),   { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false });

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const handleDone = useCallback(() => setBooted(true), []);

  return (
    <>
      {!booted && <BootScreen onDone={handleDone} />}
      <div style={{ visibility: booted ? "visible" : "hidden" }}>
        {booted && <SmoothScroll />}
        {children}
      </div>
    </>
  );
}
