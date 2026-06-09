"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  host:      "#7dcfff",
  bridge:    "#e0af68",
  kernel:    "#f7768e",
  gbm:       "#bb9af7",
  action:    "#ff9e64",
  internals: "#9ece6a",
  sources:   "#a9b1d6",   // light slate — visible but secondary
};

// ── Static node positions in 3D space (x, y, z) ──────────────────────────────
// Top band (host): y ≈ +1.8 to +0.6
// Divider:          y = 0
// Bottom band (guest): y ≈ -0.5 to -2.0
const NODES = {
  // Host band
  sources:   new THREE.Vector3(-2.8,  2.4, 0),
  launcher:  new THREE.Vector3(-0.8,  1.6, 0),
  bridge_tx: new THREE.Vector3( 2.6,  1.6, 0),
  actions:   new THREE.Vector3(-0.8,  0.7, 0),

  // Guest band
  bridge_rx: new THREE.Vector3( 2.6, -0.75, 0),
  ingestion: new THREE.Vector3( 0.2, -0.95, 0),
  gbt:       new THREE.Vector3( 0.2, -1.75, 0),
  findings:  new THREE.Vector3(-1.1, -2.5, 0),
  shell:     new THREE.Vector3( 1.4, -2.5, 0),
  internals: new THREE.Vector3( 3.2, -2.5, 0),
};

// ── Edges (pairs of node keys) ────────────────────────────────────────────────
type NodeKey = keyof typeof NODES;
const EDGES: [NodeKey, NodeKey, string][] = [
  ["sources",   "launcher",  C.host],
  ["launcher",  "bridge_tx", C.bridge],
  ["launcher",  "actions",   C.action],
  ["bridge_rx", "ingestion", C.kernel],
  ["ingestion", "gbt",       C.gbm],
  ["gbt",       "findings",  C.gbm],
  ["findings",  "shell",     C.kernel],
];

// ── Animated packet ───────────────────────────────────────────────────────────
function Packet({ from, to, delay, color }: {
  from: THREE.Vector3; to: THREE.Vector3; delay: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const raw = ((state.clock.elapsedTime * 0.48 + delay) % 1);
    const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    ref.current.position.lerpVectors(from, to, t);
    const s = 0.4 + Math.sin(raw * Math.PI) * 0.7;
    ref.current.scale.setScalar(s * 0.065);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(raw * Math.PI) * 0.4;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

// ── IO Port Bridge — animated dashed horizontal line ─────────────────────────
function BridgeLine() {
  const ref = useRef<THREE.Mesh>(null);
  // Two animated packets crossing the bridge in opposite directions
  const p1From = NODES.bridge_tx.clone();
  const p1To   = NODES.bridge_rx.clone();
  const p2From = NODES.bridge_rx.clone();
  const p2To   = NODES.bridge_tx.clone();

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      NODES.bridge_tx, NODES.bridge_rx,
    ]);
    const mat = new THREE.LineDashedMaterial({
      color: C.bridge, dashSize: 0.18, gapSize: 0.1,
      transparent: true, opacity: 0.55,
    });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, []);

  return (
    <>
      <primitive object={lineObj} />
      <Packet from={p1From} to={p1To} delay={0.0}  color={C.bridge} />
      <Packet from={p2From} to={p2To} delay={0.5}  color={C.bridge} />
    </>
  );
}

// ── Static edge line ──────────────────────────────────────────────────────────
function EdgeLine({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
    return new THREE.Line(geo, mat);
  }, [from, to, color]);
  return <primitive object={obj} />;
}

// ── Divider line ──────────────────────────────────────────────────────────────
function Divider() {
  const ref = useRef<THREE.Line>(null);
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4, 0.2, 0),
      new THREE.Vector3( 4, 0.2, 0),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: C.bridge, transparent: true, opacity: 0.35 });
    return new THREE.Line(geo, mat);
  }, []);

  useFrame((state) => {
    if (obj.material instanceof THREE.LineBasicMaterial) {
      obj.material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
    }
  });

  return <primitive ref={ref} object={obj} />;
}

// ── HTML node box ─────────────────────────────────────────────────────────────
function Node({ pos, title, sub, color, small = false }: {
  pos: THREE.Vector3; title: string; sub?: string; color: string; small?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.22 + Math.sin(state.clock.elapsedTime * 1.3 + pos.x) * 0.1;
  });

  const w = small ? 1.1 : (sub && sub.length > 22 ? 2.0 : 1.7);
  const h = small ? 0.9 : (sub ? 0.52 : 0.38);
  const boxGeo  = useMemo(() => new THREE.BoxGeometry(w, h, 0.12), [w, h]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, 0.12)), [w, h]);

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh ref={meshRef} geometry={boxGeo}>
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.22}
          metalness={0.5} roughness={0.4} transparent opacity={0.78}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} />
      </lineSegments>
      <Html center distanceFactor={5.5} style={{ pointerEvents: "none", textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={{
          fontFamily: "var(--font-jetbrains-mono, monospace)",
          fontSize: small ? "9px" : "11px",
          fontWeight: "800",
          color,
          letterSpacing: "0.12em",
          textShadow: `0 0 14px ${color}ff, 0 0 5px ${color}99`,
          lineHeight: 1.4,
        }}>
          {title}
          {sub && (
            <div style={{ fontSize: "9px", fontWeight: "600", color: "rgba(255,255,255,0.95)", letterSpacing: "0.05em", marginTop: 2 }}>
              {sub}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.14;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.04;
  });

  return (
    <>
    <ResponsiveScale groupRef={groupRef} />
    <group ref={groupRef}>
      {/* Divider + label */}
      <Divider />
      <Html
        position={[0, 0.2, 0]}
        center
        distanceFactor={6}
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      >
        <div style={{
          fontFamily: "var(--font-jetbrains-mono, monospace)",
          fontSize: "9px",
          fontWeight: "700",
          color: C.bridge,
          letterSpacing: "0.18em",
          textShadow: `0 0 8px ${C.bridge}77`,
          background: "rgba(13,17,23,0.85)",
          padding: "1px 8px",
        }}>
          ── WHPX HYPERVISOR BOUNDARY ──
        </div>
      </Html>

      {/* HOST BAND label */}
      <Html position={[-3.5, 2.55, 0]} distanceFactor={6} style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "8px", color: "rgba(125,207,255,0.4)", letterSpacing: "0.2em" }}>
          WINDOWS HOST
        </div>
      </Html>

      {/* GUEST BAND label */}
      <Html position={[-3.5, -0.55, 0]} distanceFactor={6} style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "8px", color: "rgba(247,118,142,0.4)", letterSpacing: "0.2em" }}>
          GUEST KERNEL · no_std · x86_64
        </div>
      </Html>

      {/* HOST nodes */}
      <Node pos={NODES.sources}   title="TEMP / REGISTRY / NETWORK"  color={C.sources} />
      <Node pos={NODES.launcher}  title="cyos-launcher.exe"           sub="File Walker · Authenticode · Whitelist" color={C.host} />
      <Node pos={NODES.actions}   title="QUARANTINE · FIREWALL"       sub="Taskkill · Reg Delete · Hosts" color={C.action} />
      <Node pos={NODES.bridge_tx} title="IO PORT 0x600–0x607"         sub="TX →" color={C.bridge} />

      {/* IO Bridge animated line */}
      <BridgeLine />

      {/* GUEST nodes */}
      <Node pos={NODES.bridge_rx} title="IO PORT 0x600–0x607"         sub="← RX" color={C.bridge} />
      <Node pos={NODES.ingestion} title="SCAN INGESTION"              sub="tier-0 rule engine" color={C.kernel} />
      <Node pos={NODES.gbt}       title="GBT CLASSIFIER"              sub="9-stump · 6 features · sigmoid" color={C.gbm} />
      <Node pos={NODES.findings}  title="FINDINGS STORE"              color={C.gbm} />
      <Node pos={NODES.shell}     title="cyosh SHELL"                 sub="explain · verdict · kill" color={C.kernel} />

      {/* Kernel internals — compact stacked box, bottom-right, no overlap */}
      <group position={[NODES.internals.x, NODES.internals.y, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.2, 0.12]} />
          <meshStandardMaterial color={C.internals} emissive={C.internals} emissiveIntensity={0.22} metalness={0.5} roughness={0.4} transparent opacity={0.78} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.5, 1.2, 0.12)]} />
          <lineBasicMaterial color={C.internals} />
        </lineSegments>
        <Html center distanceFactor={5.5} style={{ pointerEvents: "none", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", fontWeight: "700", color: C.internals, textShadow: `0 0 8px ${C.internals}aa`, lineHeight: 1.6, letterSpacing: "0.08em" }}>
            <div style={{ fontSize: "8px", color: "rgba(158,206,106,0.7)", letterSpacing: "0.18em", marginBottom: 3 }}>KERNEL INTERNALS</div>
            <div>GDT · IDT · TSS</div>
            <div>4-level paging (NX)</div>
            <div>Preempt 100 Hz</div>
            <div>SYSCALL/SYSRET</div>
          </div>
        </Html>
      </group>

      {/* Static edges */}
      {EDGES.map(([a, b, color], i) => (
        <EdgeLine key={i} from={NODES[a]} to={NODES[b]} color={color} />
      ))}

      {/* Animated packets on edges */}
      <Packet from={NODES.sources}   to={NODES.launcher}  delay={0.0}  color={C.host} />
      <Packet from={NODES.launcher}  to={NODES.actions}   delay={0.4}  color={C.action} />
      <Packet from={NODES.bridge_rx} to={NODES.ingestion} delay={0.8}  color={C.kernel} />
      <Packet from={NODES.ingestion} to={NODES.gbt}       delay={1.2}  color={C.gbm} />
      <Packet from={NODES.gbt}       to={NODES.findings}  delay={1.6}  color={C.gbm} />
      <Packet from={NODES.findings}  to={NODES.shell}     delay={2.0}  color={C.kernel} />
    </group>
    </>
  );
}

// ── Responsive scene scale — shrinks on narrow screens ───────────────────────
function ResponsiveScale({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const { size } = useThree();
  useFrame(() => {
    if (!groupRef.current) return;
    // Scale down proportionally on mobile so wide diagram fits without going tiny
    const target = size.width < 420 ? 0.62 : size.width < 600 ? 0.74 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.06);
  });
  return null;
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function CyberOSArch() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 56 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 4]}   intensity={2} color="#7dcfff" />
      <pointLight position={[-2, -3, 3]} intensity={1.5} color="#f7768e" />
      <Scene />
    </Canvas>
  );
}
