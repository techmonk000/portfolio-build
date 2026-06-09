import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swarnavo Mukherjee — GPU Systems & LLM Inference Engineer",
  description:
    "Software engineer building high-performance systems for LLM inference, CUDA kernels, and GPU hypervisors. Creator of Nebion and Cyber-OS.",
  keywords: ["CUDA", "Rust", "LLM Inference", "GPU Systems", "HPC"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="font-sans bg-[#020408] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
