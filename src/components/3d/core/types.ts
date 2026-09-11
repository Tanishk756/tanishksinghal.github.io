import { SubsystemId, SubsystemInfo, SUBSYSTEMS } from '../types';
import { ProjectCategory } from '../../../types/content';

export { type SubsystemId, type SubsystemInfo, SUBSYSTEMS };

/**
 * Canonical 3D Visual Archetype Taxonomy
 * 
 * Provides deterministic frontend presentation mapping from real Supabase content
 * categories without inventing fake physical data or modifying the database schema.
 */
export type VisualArchetype =
  | 'wheeled-robot'
  | 'robotic-arm'
  | 'uav-drone'
  | 'cubesat-satellite'
  | 'embedded-pcb'
  | 'systems-pipeline'
  | 'humanoid';

/**
 * Deterministic Project Category -> 3D Visual Archetype Mapper
 * 
 * Maps authentic database ProjectCategory to its visual 3D archetype representation.
 */
export function mapProjectCategoryToArchetype(category: ProjectCategory | string): VisualArchetype {
  switch (category) {
    case 'robotics':
      return 'wheeled-robot';
    case 'autonomy':
      return 'robotic-arm';
    case 'uav-aerospace':
      return 'uav-drone';
    case 'space-systems':
      return 'cubesat-satellite';
    case 'embedded':
      return 'embedded-pcb';
    case 'ai-ml':
    case 'software-tools':
      return 'systems-pipeline';
    default:
      return 'wheeled-robot';
  }
}

/**
 * 3D Global World Zones for Spatial Navigation
 */
export type WorldZone =
  | 'world-hub'
  | 'robotics'
  | 'aerospace'
  | 'systems'
  | 'electronics';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  enableRotate?: boolean;
}

/**
 * Standardized Camera Presets for Cohesive Spatial Navigation
 */
export const CAMERA_PRESETS: Record<WorldZone, CameraPreset> = {
  'world-hub': {
    position: [3.8, 3.0, 4.2],
    target: [0, 0.4, 0],
    fov: 38,
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: (Math.PI / 180) * 80,
  },
  'robotics': {
    position: [3.2, 2.5, 3.5],
    target: [-0.3, 0.4, 0],
    fov: 36,
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: (Math.PI / 180) * 80,
  },
  'aerospace': {
    position: [2.8, 3.6, 4.0],
    target: [0.5, 0.8, -0.2],
    fov: 35,
    minPolarAngle: Math.PI / 6,
    maxPolarAngle: (Math.PI / 180) * 85,
  },
  'systems': {
    position: [0.0, 4.5, 3.8],
    target: [0, 0.1, 0],
    fov: 34,
    minPolarAngle: Math.PI / 6,
    maxPolarAngle: (Math.PI / 180) * 75,
  },
  'electronics': {
    position: [2.2, 2.4, 2.8],
    target: [0, 0.15, 0],
    fov: 32,
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: (Math.PI / 180) * 80,
  },
};

/**
 * Editorial 3D Theme Palette Tokens
 * Consistent with the portfolio's warm alabaster / stone / technical graphite identity.
 */
export const THEME_PALETTE = {
  background: '#fbfaf7',
  paperSurface: '#edeae4',
  paperSurfaceDark: '#dfdbd4',
  graphite: '#141517',
  graphiteMedium: '#26282b',
  graphiteLight: '#3d4045',
  terracotta: '#c2410c',
  terracottaHover: '#ea580c',
  stone: '#8c827a',
  stoneLight: '#d6d1ca',
  gridLine: '#dfdbd4',
  opticalLens: '#1e3a8a',
  copperTrace: '#b45309',
  shadowColor: '#141517',
} as const;

/**
 * Reusable Interactive Object State Payload for Hover/Click raycasting
 */
export interface InteractiveInspectionPayload {
  id: string;
  title: string;
  category: string;
  description: string;
  archetype?: VisualArchetype;
  routeUrl?: string;
  actionLabel?: string;
  specs?: string[];
}
