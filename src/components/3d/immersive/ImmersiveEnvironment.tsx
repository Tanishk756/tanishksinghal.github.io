import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

/**
 * Architectural Engineering Environment
 * 
 * Provides an expansive floor grid, subtle spatial coordinate dividers,
 * atmospheric depth fog, and balanced studio lighting.
 */
export const ImmersiveEnvironment: React.FC = () => {
  const { scene } = useThree();

  // Linear atmospheric studio fog: near 4 units, far 17 units.
  // Perfectly isolates the active zone while smoothly dissolving distant zones into background.
  useMemo(() => {
    scene.background = new THREE.Color('#fbfaf7');
    scene.fog = new THREE.Fog('#fbfaf7', 4, 18);
  }, [scene]);

  return (
    <group>
      {/* 1. STUDIO LIGHTING RIG */}
      <ambientLight intensity={1.1} color="#ffffff" />
      
      {/* Warm Key Light */}
      <directionalLight
        position={[8, 16, 10]}
        intensity={1.4}
        color="#fffbf5"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      
      {/* Cool Slate Fill Light */}
      <directionalLight
        position={[-10, 8, -20]}
        intensity={0.6}
        color="#f1f5f9"
      />

      {/* Under-Glow Bounce Light */}
      <directionalLight
        position={[0, -4, -30]}
        intensity={0.25}
        color="#f8fafc"
      />

      {/* 2. RESTRAINED ARCHITECTURAL FLOOR GRID */}
      <group position={[0, -0.01, -40]}>
        <gridHelper
          args={[160, 80, '#e2ded7', '#f1ede6']}
          position={[0, 0, 0]}
        />
      </group>

      {/* 3. CARDINAL SPATIAL GUIDES & LATITUDE MARKERS */}
      <group position={[0, 0, 0]}>
        {/* Longitudinal Architectural Centerline */}
        <mesh position={[0, 0.001, -45]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 100]} />
          <meshBasicMaterial color="#d6d3d1" transparent opacity={0.35} />
        </mesh>

        {/* Quiet Zone Latitude Dividers */}
        {[-7, -21, -35, -49, -63, -77].map((z, i) => (
          <group key={i} position={[0, 0.002, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[14, 0.015]} />
              <meshBasicMaterial color="#e7e5e4" transparent opacity={0.4} />
            </mesh>
            {/* Coordinate Marker Dots */}
            {[-4, 0, 4].map((x, j) => (
              <mesh key={j} position={[x, 0.004, 0]}>
                <circleGeometry args={[0.02, 10]} />
                <meshBasicMaterial color={j === 1 ? '#c2410c' : '#d6d3d1'} transparent opacity={0.6} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};
