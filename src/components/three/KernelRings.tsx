"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Threat particle that tries to enter the kernel
function ThreatParticle({ angle, delay }: { angle: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const intercepted = useRef(false);
  const flash = useRef(0);

  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime * 0.5 + delay) % 3) / 3;
    const radius = 4.5 - t * 3.5;

    ref.current.position.x = Math.cos(angle) * radius;
    ref.current.position.y = Math.sin(angle) * radius;

    // Gets intercepted at ring-0 (~radius 1)
    if (radius < 1.2 && !intercepted.current) {
      intercepted.current = true;
      flash.current = 1;
    }
    if (intercepted.current) {
      flash.current = Math.max(0, flash.current - 0.04);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      if (flash.current > 0.5) {
        mat.color.set("#FF2D78");
        ref.current.scale.setScalar(0.5 + flash.current * 1.5);
      } else {
        mat.color.set("#FF4444");
        ref.current.scale.setScalar(Math.max(0.05, flash.current));
      }
      if (flash.current <= 0) intercepted.current = false;
    } else {
      (ref.current.material as THREE.MeshBasicMaterial).color.set("#FF4444");
      ref.current.scale.setScalar(0.15);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#FF4444" />
    </mesh>
  );
}

// Kernel privilege rings
function KernelRing({ radius, color, speed, opacity = 0.6 }: {
  radius: number;
  color: string;
  speed: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity * (0.7 + Math.sin(state.clock.elapsedTime * 2 + radius) * 0.3);
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.025, 8, 80]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

// Ring label dots
function RingLabel({ radius, label, color }: { radius: number; label: string; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = -state.clock.elapsedTime * 0.1;
  });
  return (
    <group ref={ref}>
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// Rotating kernel core
function KernelCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.5;
    ref.current.rotation.y = state.clock.elapsedTime * 0.7;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.35, 1]} />
      <meshStandardMaterial
        color="#00D4FF"
        emissive="#00D4FF"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const threats = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      delay: i * 0.37,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      <KernelRing radius={1.0} color="#00D4FF" speed={0.3} opacity={0.9} />
      <KernelRing radius={1.8} color="#39FF14" speed={0.18} opacity={0.6} />
      <KernelRing radius={2.7} color="#AA88FF" speed={0.1} opacity={0.4} />
      <KernelRing radius={3.6} color="#FF6B35" speed={0.06} opacity={0.25} />
      <KernelCore />
      {threats.map((t, i) => (
        <ThreatParticle key={i} {...t} />
      ))}
    </group>
  );
}

export default function KernelRings() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 4]} intensity={2} color="#00D4FF" />
      <pointLight position={[3, 3, 2]} intensity={0.8} color="#FF2D78" />
      <Scene />
    </Canvas>
  );
}
