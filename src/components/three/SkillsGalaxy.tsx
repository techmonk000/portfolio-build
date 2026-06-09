"use client";
import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { getPerfTier } from "@/lib/performance";

type SkillNode = {
  id: string;
  label: string;
  cluster: "gpu" | "ml" | "backend" | "systems";
  connections: string[];
};

const SKILLS: SkillNode[] = [
  // GPU / CUDA cluster
  { id: "cuda", label: "CUDA", cluster: "gpu", connections: ["ptx", "wmma", "rust", "flash_attn"] },
  { id: "ptx", label: "PTX ASM", cluster: "gpu", connections: ["cuda", "wmma"] },
  { id: "wmma", label: "WMMA Tensor-Core", cluster: "gpu", connections: ["cuda", "ptx", "flash_attn"] },
  { id: "flash_attn", label: "Flash Attention", cluster: "gpu", connections: ["cuda", "wmma", "pytorch"] },
  // Systems cluster
  { id: "rust", label: "Rust", cluster: "systems", connections: ["cuda", "tokio", "axum", "cpp"] },
  { id: "cpp", label: "C++", cluster: "systems", connections: ["rust", "cuda"] },
  { id: "tokio", label: "Tokio async", cluster: "systems", connections: ["rust", "axum"] },
  { id: "axum", label: "Axum", cluster: "backend", connections: ["tokio", "rust", "nextjs"] },
  { id: "x86", label: "x86_64 Ring-0", cluster: "systems", connections: ["rust", "cpp"] },
  // ML cluster
  { id: "pytorch", label: "PyTorch", cluster: "ml", connections: ["cuda", "flash_attn", "safetensors"] },
  { id: "safetensors", label: "safetensors", cluster: "ml", connections: ["pytorch"] },
  { id: "kv_compress", label: "KV Compression", cluster: "ml", connections: ["flash_attn", "pytorch", "cuda"] },
  // Backend cluster
  { id: "nextjs", label: "Next.js", cluster: "backend", connections: ["typescript", "axum"] },
  { id: "typescript", label: "TypeScript", cluster: "backend", connections: ["nextjs"] },
  { id: "postgres", label: "Postgres", cluster: "backend", connections: ["axum", "nextjs"] },
  { id: "docker", label: "Docker", cluster: "backend", connections: ["axum", "postgres"] },
];

const CLUSTER_COLORS = {
  gpu: "#00D4FF",
  ml: "#AA88FF",
  backend: "#39FF14",
  systems: "#FF6B35",
};

const CLUSTER_POSITIONS: Record<string, [number, number, number]> = {
  gpu: [-2.5, 1.5, 0],
  systems: [2.5, 1.5, 0],
  ml: [-2.5, -1.5, 0],
  backend: [2.5, -1.5, 0],
};

function computeNodePositions(): Record<string, THREE.Vector3> {
  const positions: Record<string, THREE.Vector3> = {};
  const clusterGroups: Record<string, SkillNode[]> = { gpu: [], ml: [], backend: [], systems: [] };
  SKILLS.forEach((s) => clusterGroups[s.cluster].push(s));

  Object.entries(clusterGroups).forEach(([cluster, nodes]) => {
    const center = new THREE.Vector3(...CLUSTER_POSITIONS[cluster]);
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = 1.1 + Math.random() * 0.3;
      positions[node.id] = new THREE.Vector3(
        center.x + Math.cos(angle) * radius * 0.7,
        center.y + Math.sin(angle) * radius * 0.5,
        (Math.random() - 0.5) * 1.5,
      );
    });
  });
  return positions;
}

function SkillNodeMesh({
  node,
  position,
  isHovered,
  isConnected,
  onHover,
}: {
  node: SkillNode;
  position: THREE.Vector3;
  isHovered: boolean;
  isConnected: boolean;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const color = CLUSTER_COLORS[node.cluster];

  useFrame((state) => {
    if (!ref.current) return;
    const scale = isHovered ? 1.6 : isConnected ? 1.25 : 1.0;
    ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
    ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 1.2 + position.x) * 0.04;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = isHovered
      ? 0.9
      : isConnected
      ? 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      : 0.2 + Math.sin(state.clock.elapsedTime * 1.5 + position.z) * 0.1;
  });

  return (
    <mesh
      ref={ref}
      position={position.toArray()}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(node.id); }}
      onPointerLeave={() => onHover(null)}
    >
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        metalness={0.6}
        roughness={0.2}
      />
      {isHovered && (
        <Html center distanceFactor={6}>
          <div
            className="px-2 py-1 font-mono text-xs whitespace-nowrap pointer-events-none"
            style={{
              color,
              backgroundColor: "rgba(2,4,8,0.9)",
              border: `1px solid ${color}60`,
              borderRadius: "2px",
              textShadow: `0 0 8px ${color}`,
            }}
          >
            {node.label}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function ConnectionLine({
  from,
  to,
  active,
  color,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  active: boolean;
  color: string;
}) {
  const lineRef = useRef<THREE.Line | null>(null);

  const lineObj = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.06, depthWrite: false });
    const l = new THREE.Line(g, mat);
    lineRef.current = l;
    return l;
  }, [from, to]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    if (active) {
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      mat.color.set(color);
    } else {
      mat.opacity = 0.06;
      mat.color.set("#ffffff");
    }
  });

  return <primitive object={lineObj} />;
}

function GalaxyScene({ onHoverLabel }: { onHoverLabel: (label: string | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const positions = useMemo(() => computeNodePositions(), []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
    if (id) {
      const node = SKILLS.find((s) => s.id === id);
      onHoverLabel(node?.label ?? null);
    } else {
      onHoverLabel(null);
    }
  }, [onHoverLabel]);

  const hoveredNode = SKILLS.find((s) => s.id === hoveredId);
  const connectedIds = new Set(hoveredNode?.connections ?? []);
  if (hoveredId) connectedIds.add(hoveredId);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  // Build connection pairs (deduplicated)
  const connectionPairs = useMemo(() => {
    const pairs: Array<{ from: string; to: string; key: string }> = [];
    const seen = new Set<string>();
    SKILLS.forEach((node) => {
      node.connections.forEach((targetId) => {
        const key = [node.id, targetId].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push({ from: node.id, to: targetId, key });
        }
      });
    });
    return pairs;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      {connectionPairs.map(({ from, to, key }) => {
        const fromPos = positions[from];
        const toPos = positions[to];
        if (!fromPos || !toPos) return null;
        const active = hoveredId !== null && (connectedIds.has(from) && connectedIds.has(to));
        const fromNode = SKILLS.find((s) => s.id === from);
        const color = fromNode ? CLUSTER_COLORS[fromNode.cluster] : "#ffffff";
        return (
          <ConnectionLine key={key} from={fromPos} to={toPos} active={active} color={color} />
        );
      })}

      {/* Skill nodes */}
      {SKILLS.map((node) => (
        <SkillNodeMesh
          key={node.id}
          node={node}
          position={positions[node.id]}
          isHovered={hoveredId === node.id}
          isConnected={hoveredId !== null && connectedIds.has(node.id)}
          onHover={handleHover}
        />
      ))}
    </group>
  );
}

export default function SkillsGalaxy() {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 5, 5]} intensity={1.5} color="#00D4FF" />
        <pointLight position={[0, -5, 3]} intensity={0.8} color="#AA88FF" />
        <GalaxyScene onHoverLabel={setHoveredLabel} />
      </Canvas>
      {hoveredLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-xs text-[#00D4FF] bg-[#020408]/80 border border-[#00D4FF]/30 px-3 py-1 pointer-events-none">
          {hoveredLabel}
        </div>
      )}
    </div>
  );
}
