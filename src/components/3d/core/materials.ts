import * as THREE from 'three';
import { THEME_PALETTE } from './types';

/**
 * Global Editorial Materials Factory & Singletons
 * 
 * Reuses geometry materials across all 3D scenes to minimize shader compilation,
 * WebGL context state changes, and draw calls (<35 budget).
 */

// 1. Chassis & Structure (Dark Graphite Technical Metal)
export const chassisMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.graphite,
  roughness: 0.35,
  metalness: 0.8,
});

// 2. Alabaster Paper Top Cover / Shell
export const shellMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.paperSurface,
  roughness: 0.6,
  metalness: 0.15,
});

// 3. Drive & Tire Rubber
export const rubberMaterial = new THREE.MeshStandardMaterial({
  color: '#1a1c1e',
  roughness: 0.9,
  metalness: 0.05,
});

// 4. Accent & Active State (Terracotta Red/Orange)
export const terracottaMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.terracotta,
  roughness: 0.4,
  metalness: 0.3,
  emissive: THEME_PALETTE.terracotta,
  emissiveIntensity: 0.15,
});

// 5. Highlight / Selected State Material
export const highlightMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.terracottaHover,
  roughness: 0.3,
  metalness: 0.4,
  emissive: THEME_PALETTE.terracottaHover,
  emissiveIntensity: 0.4,
});

// 6. Sensor Optical Lens (Deep Blue Tint)
export const opticalLensMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.opticalLens,
  roughness: 0.1,
  metalness: 0.9,
});

// 7. Metallic Joint / Standoff Screws / Shafts
export const metalJointMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.stone,
  roughness: 0.25,
  metalness: 0.85,
});

// 8. Circuit Board / PCB FR4 Substrate
export const pcbSubstrateMaterial = new THREE.MeshStandardMaterial({
  color: '#1e2922',
  roughness: 0.5,
  metalness: 0.2,
});

// 9. Copper Traces / SMD Pads
export const copperTraceMaterial = new THREE.MeshStandardMaterial({
  color: THEME_PALETTE.copperTrace,
  roughness: 0.2,
  metalness: 0.95,
});
