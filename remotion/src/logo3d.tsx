// logo3d.tsx — X 3D dourado flutuando, com dolly de câmera real (Three.js via @remotion/three).
// Animação dirigida por useCurrentFrame (determinístico p/ render), NÃO useFrame.
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

// barra de extrusão (cria geometria de uma barra grossa do X)
const BarraX: React.FC<{ rotZ: number; cor: string }> = ({ rotZ, cor }) => {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 0.45, h = 3.2;
    shape.moveTo(-w, -h / 2);
    shape.lineTo(w, -h / 2);
    shape.lineTo(w, h / 2);
    shape.lineTo(-w, h / 2);
    shape.lineTo(-w, -h / 2);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 4 });
  }, []);
  return (
    <mesh geometry={geo} rotation={[0, 0, rotZ]}>
      <meshStandardMaterial color={cor} metalness={0.85} roughness={0.25} emissive={cor} emissiveIntensity={0.15} />
    </mesh>
  );
};

const CenaTres: React.FC = () => {
  const frame = useCurrentFrame();
  // float + giro lento do grupo
  const giroY = Math.sin(frame * 0.03) * 0.5;
  const flutua = Math.sin(frame * 0.06) * 0.25;
  const giroZ = frame * 0.004;
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 6]} intensity={1.1} color="#fff6d6" />
      <pointLight position={[-4, 2, 4]} intensity={0.8} color="#a974ff" />
      <group rotation={[0.15, giroY, giroZ]} position={[0, flutua, 0]}>
        <BarraX rotZ={Math.PI / 4} cor="#e9cd6a" />
        <BarraX rotZ={-Math.PI / 4} cor="#d4af37" />
      </group>
    </>
  );
};

export const Logo3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // dolly-in real: câmera aproxima de z=9 → z=5.5
  const camZ = interpolate(frame, [0, 90], [9, 5.5], { extrapolateRight: "clamp" });
  const camY = Math.sin(frame * 0.04) * 0.6;
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, camY, camZ], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <CenaTres />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};