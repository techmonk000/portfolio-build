// Detect GPU tier and reduce particle counts on weaker hardware
export type PerfTier = "high" | "medium" | "low";

let cached: PerfTier | null = null;

export function getPerfTier(): PerfTier {
  if (cached) return cached;
  if (typeof window === "undefined") return "medium";

  const gl = document.createElement("canvas").getContext("webgl2") as WebGL2RenderingContext | null
    ?? document.createElement("canvas").getContext("webgl") as WebGLRenderingContext | null;

  if (!gl) { cached = "low"; return cached; }

  const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = dbgInfo
    ? (gl as WebGLRenderingContext).getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) as string
    : "";

  const isHighEnd = /nvidia|radeon rx [5-9]|rtx|h100|a100|3090|4090/i.test(renderer);
  const isLowEnd = /intel hd|intel uhd|mali|adreno [23]/i.test(renderer);

  cached = isHighEnd ? "high" : isLowEnd ? "low" : "medium";
  return cached;
}

export const PARTICLE_COUNTS: Record<PerfTier, number> = {
  high: 80000,
  medium: 40000,
  low: 15000,
};

export const STAR_COUNTS: Record<PerfTier, number> = {
  high: 200,
  medium: 120,
  low: 60,
};
