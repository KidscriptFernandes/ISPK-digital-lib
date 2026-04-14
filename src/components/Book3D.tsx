import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

function BookMesh() {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [opened, setOpened] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Gentle float
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    // Rotate towards target
    const targetY = opened ? -0.8 : hovered ? 0.3 : 0;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * delta * 3;
    const targetX = hovered ? -0.1 : 0.15;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * delta * 3;
  });

  return (
    <group
      ref={groupRef}
      rotation={[0.15, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setOpened((o) => !o)}
    >
      {/* Book cover */}
      <RoundedBox args={[1.4, 2, 0.15]} radius={0.03} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B1A1A" roughness={0.4} metalness={0.1} />
      </RoundedBox>

      {/* Spine */}
      <RoundedBox args={[0.16, 2, 0.15]} radius={0.02} smoothness={4} position={[-0.78, 0, 0]}>
        <meshStandardMaterial color="#6B0F0F" roughness={0.3} metalness={0.2} />
      </RoundedBox>

      {/* Pages */}
      <RoundedBox args={[1.3, 1.9, 0.12]} radius={0.01} smoothness={2} position={[0.02, 0, 0]}>
        <meshStandardMaterial color="#F5F0E8" roughness={0.8} />
      </RoundedBox>

      {/* Gold title decoration */}
      <mesh position={[0, 0.4, 0.08]}>
        <planeGeometry args={[0.9, 0.08]} />
        <meshStandardMaterial color="#D4A843" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4, 0.08]}>
        <planeGeometry args={[0.9, 0.08]} />
        <meshStandardMaterial color="#D4A843" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Title text */}
      <Text
        position={[0, 0.05, 0.081]}
        fontSize={0.12}
        color="#D4A843"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
        maxWidth={1.1}
      >
        BIBLIOTECA
      </Text>
      <Text
        position={[0, -0.12, 0.081]}
        fontSize={0.08}
        color="#E8D5A0"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
        maxWidth={1.1}
      >
        ISPK
      </Text>
    </group>
  );
}

export function Book3D() {
  return (
    <div className="w-full h-[280px] md:h-[340px] cursor-pointer">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#FFD700" />
          <pointLight position={[0, -2, 3]} intensity={0.4} color="#FF6B35" />
          <BookMesh />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
      <p className="text-center text-xs text-muted-foreground mt-1 animate-pulse">
        Clique no livro para interagir ✨
      </p>
    </div>
  );
}
