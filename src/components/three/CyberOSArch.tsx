"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Same vertical-stack pattern as NebionArch — compact, mobile-safe
const LAYERS = [
  { id: "sources",   y:  2.1, label: "HOST SOURCES",        sub: "TEMP · Registry · Network",        color: "#a9b1d6", w: 3.2 },
  { id: "launcher",  y:  1.1, label: "cyos-launcher.exe",   sub: "File Walker · Authenticode",        color: "#7dcfff", w: 3.2 },
  { id: "bridge",    y:  0.1, label: "IO BRIDGE 0x600–0x607", sub: "WHPX Hypervisor Boundary ──",    color: "#e0af68", w: 3.2 },
  { id: "ingestion", y: -0.8, label: "SCAN INGESTION",      sub: "tier-0 rule engine",                color: "#f7768e", w: 3.2 },
  { id: "gbt",       y: -1.7, label: "GBT CLASSIFIER",      sub: "9-stump · 6 features · sigmoid",   color: "#bb9af7", w: 3.2 },
  { id: "shell",     y: -2.55,label: "cyosh SHELL",         sub: "explain · verdict · kill",          color: "#9ece6a", w: 3.2 },
];

const EDGES: [number, number][] = [[0,1],[1,2],[2,3],[3,4],[4,5]];

// ── Layer node (identical to NebionArch) ─────────────────────────────────────
function LayerNode({ layer, t }: { layer: typeof LAYERS[0]; t: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const pulse = 0.28 + Math.sin(state.clock.elapsedTime * 1.4 + t * 1.8) * 0.12;
    if (meshRef.current)
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.1 + t) * 0.04);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.05 + Math.sin(state.clock.elapsedTime * 1.1 + t) * 0.025;
    }
  });

  const w = layer.w, h = 0.42, d = 0.18;
  const boxGeo  = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), [w, h, d]);
  const glowGeo = useMemo(() => new THREE.BoxGeometry(w + 0.2, h + 0.2, d + 0.1), [w, h, d]);

  return (
    <group position={[0, layer.y, 0]}>
      <mesh ref={glowRef} geometry={glowGeo}>
        <meshBasicMaterial color={layer.color} transparent opacity={0.05} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef} geometry={boxGeo}>
        <meshStandardMaterial
          color={layer.color} emissive={layer.color} emissiveIntensity={0.28}
          metalness={0.6} roughness={0.35} transparent opacity={0.85}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={layer.color} />
      </lineSegments>
      <Html center distanceFactor={6} style={{ pointerEvents: "none", textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={{
          fontFamily: "var(--font-jetbrains-mono, monospace)",
          fontSize: "12px", fontWeight: "800",
          color: layer.color,
          letterSpacing: "0.14em",
          textShadow: `0 0 14px ${layer.color}ff, 0 0 5px ${layer.color}99`,
          lineHeight: 1.3,
        }}>
          {layer.label}
          <div style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.95)", letterSpacing: "0.06em", marginTop: 2 }}>
            {layer.sub}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Data packet ───────────────────────────────────────────────────────────────
function Packet({ from, to, delay, color }: {
  from: THREE.Vector3; to: THREE.Vector3; delay: number; color: string;
}) {
  const headRef  = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!headRef.current) return;
    const raw = ((state.clock.elapsedTime * 0.52 + delay) % 1);
    const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    headRef.current.position.lerpVectors(from, to, t);
    const s = 0.5 + Math.sin(raw * Math.PI) * 0.7;
    headRef.current.scale.setScalar(s * 0.075);
    if (trailRef.current) {
      trailRef.current.position.lerpVectors(from, to, Math.max(0, t - 0.09));
      trailRef.current.scale.setScalar(s * 0.05);
      (trailRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * Math.sin(raw * Math.PI);
    }
  });

  return (
    <group>
      <mesh ref={trailRef}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh ref={headRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// ── Edge line ─────────────────────────────────────────────────────────────────
function EdgeLine({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 });
    return new THREE.Line(geo, mat);
  }, [from, to, color]);
  return <primitive object={obj} />;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function ArchScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.22;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
  });

  const centres = useMemo(() =>
    LAYERS.map(l => new THREE.Vector3(0, l.y, 0)), []);

  const packets = useMemo(() => [
    { from: centres[0], to: centres[1], delay: 0.0,  color: LAYERS[0].color },
    { from: centres[1], to: centres[2], delay: 0.32, color: LAYERS[1].color },
    { from: centres[2], to: centres[3], delay: 0.64, color: LAYERS[2].color },
    { from: centres[3], to: centres[4], delay: 0.96, color: LAYERS[3].color },
    { from: centres[4], to: centres[5], delay: 1.28, color: LAYERS[4].color },
  ], [centres]);

  return (
    <group ref={groupRef}>
      {LAYERS.map((l, i) => <LayerNode key={l.id} layer={l} t={i * 0.6} />)}
      {EDGES.map(([a, b], i) => (
        <EdgeLine key={i} from={centres[a]} to={centres[b]} color={LAYERS[a].color} />
      ))}
      {packets.map((p, i) => <Packet key={i} {...p} />)}
    </group>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function CyberOSArch() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 4]}  intensity={2.5} color="#7dcfff" />
      <pointLight position={[-3, -3, 3]} intensity={1.5} color="#f7768e" />
      <pointLight position={[0, 0, 5]}  intensity={0.7} color="#ffffff" />
      <ArchScene />
    </Canvas>
  );
}
