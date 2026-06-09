"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// A data packet that travels between tiers
function DataPacket({
  startY,
  endY,
  delay,
  color,
}: {
  startY: number;
  endY: number;
  delay: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime + delay) % 2.5) / 2.5;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    ref.current.position.y = startY + (endY - startY) * eased;
    ref.current.position.x = Math.sin(state.clock.elapsedTime * 3 + delay) * 0.08;
    const scale = 0.5 + Math.sin(t * Math.PI) * 0.5;
    ref.current.scale.setScalar(scale * 0.15);
  });

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// A memory tier slab
function MemoryTier({
  y,
  label,
  sublabel,
  color,
  width = 3.5,
}: {
  y: number;
  label: string;
  sublabel: string;
  color: string;
  width?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const hexColor = new THREE.Color(color);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ref}>
        <boxGeometry args={[width, 0.4, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Glowing edge lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.4, 0.3)]} />
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.25;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.08;
  });

  const tiers = [
    { y: 1.2, label: "HBM", sublabel: "Hot KV Cache", color: "#00D4FF" },
    { y: 0, label: "PINNED RAM", sublabel: "Warm KV Cache", color: "#AA88FF" },
    { y: -1.2, label: "NVMe", sublabel: "Cold KV Cache", color: "#FF6B35" },
  ];

  const packets = useMemo(() => [
    { startY: 1.0, endY: 0.2, delay: 0, color: "#00D4FF" },
    { startY: 0.2, endY: -1.0, delay: 0.8, color: "#AA88FF" },
    { startY: 1.0, endY: -1.0, delay: 1.6, color: "#00D4FF" },
    { startY: -1.0, endY: 0.2, delay: 2.2, color: "#FF6B35" },
  ], []);

  return (
    <group ref={groupRef}>
      {tiers.map((tier) => (
        <MemoryTier key={tier.label} {...tier} />
      ))}
      {/* Connector lines between tiers */}
      {[0].map((_, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 1.0, 0),
          new THREE.Vector3(0, -1.0, 0),
        ]);
        const lineObj = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#ffffff", opacity: 0.08, transparent: true }));
        return <primitive key={i} object={lineObj} />;
      })}
      {packets.map((p, i) => (
        <DataPacket key={i} {...p} />
      ))}
    </group>
  );
}

export default function MemoryHierarchy() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 3]} intensity={2} color="#00D4FF" />
      <pointLight position={[0, -3, 3]} intensity={1} color="#FF6B35" />
      <Scene />
    </Canvas>
  );
}
