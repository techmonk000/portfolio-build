"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { getPerfTier, PARTICLE_COUNTS } from "@/lib/performance";

// --- GPU die grid of tensor-core nodes ---
function TensorCoreGrid() {
  const groupRef = useRef<THREE.Group>(null);
  const COLS = 12;
  const ROWS = 8;
  const spacing = 0.55;

  const meshes = useMemo(() => {
    const items = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c - COLS / 2) * spacing;
        const y = (r - ROWS / 2) * spacing;
        const isActive = Math.random() > 0.25;
        const intensity = Math.random();
        items.push({ x, y, isActive, intensity, id: r * COLS + c });
      }
    }
    return items;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.08;
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.12;

    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const phase = meshes[i]?.intensity ?? 0;
      const pulse = (Math.sin(t * 2.5 + phase * Math.PI * 2) + 1) * 0.5;
      if (meshes[i]?.isActive) {
        mat.emissiveIntensity = 0.3 + pulse * 0.7;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {meshes.map(({ x, y, isActive, id }) => (
        <mesh key={id} position={[x, y, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.06]} />
          <meshStandardMaterial
            color={isActive ? "#00D4FF" : "#0A1A2A"}
            emissive={isActive ? "#00D4FF" : "#000000"}
            emissiveIntensity={isActive ? 0.5 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- CUDA warp particle stream ---
function WarpStream() {
  const meshRef = useRef<THREE.Points>(null);
  const tier = useMemo(() => getPerfTier(), []);
  const count = PARTICLE_COUNTS[tier];

  const [positions, velocities, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const ph = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 4;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
      vel[i] = 0.3 + Math.random() * 0.7;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, vel, ph];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime * 0.5;

    for (let i = 0; i < count; i++) {
      const speed = velocities[i] * 0.012;
      pos[i * 3 + 1] -= speed;

      if (pos[i * 3 + 1] < -3.5) {
        pos[i * 3 + 1] = 3.5;
        const theta = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 4;
        pos[i * 3] = Math.cos(theta) * radius;
        pos[i * 3 + 2] = Math.sin(theta) * radius;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#00D4FF"
        size={0.018}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// --- Floating circuit lines ---
function CircuitLines() {
  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < 20; i++) {
      const points = [];
      let x = (Math.random() - 0.5) * 10;
      let y = (Math.random() - 0.5) * 7;
      const z = (Math.random() - 0.5) * 3;
      points.push(new THREE.Vector3(x, y, z));
      const segs = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs; s++) {
        if (Math.random() > 0.5) x += (Math.random() - 0.5) * 2;
        else y += (Math.random() - 0.5) * 1.5;
        points.push(new THREE.Vector3(x, y, z));
      }
      result.push(points);
    }
    return result;
  }, []);

  return (
    <>
      {lines.map((pts, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineObj = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#00D4FF", opacity: 0.08, transparent: true }));
        return <primitive key={i} object={lineObj} />;
      })}
    </>
  );
}

// --- Ambient ring around die ---
function DieRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.2;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[3.5, 0.015, 8, 100]} />
      <meshBasicMaterial color="#00D4FF" opacity={0.25} transparent />
    </mesh>
  );
}

function DieRing2() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = -state.clock.elapsedTime * 0.12;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.3;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[4.2, 0.01, 8, 100]} />
      <meshBasicMaterial color="#FF2D78" opacity={0.18} transparent />
    </mesh>
  );
}

// --- Camera rig: subtle mouse parallax ---
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 3]} intensity={2} color="#00D4FF" />
      <pointLight position={[-5, 3, -2]} intensity={0.8} color="#FF2D78" />
      <pointLight position={[5, -3, 2]} intensity={0.5} color="#00D4FF" />

      <TensorCoreGrid />
      <WarpStream />
      <CircuitLines />
      <DieRing />
      <DieRing2 />
      <CameraRig />
    </Canvas>
  );
}
