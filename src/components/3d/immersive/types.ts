import * as THREE from 'three';
import { ProjectCaseStudy } from '../../../types/content';
import { VisualArchetype } from '../core/types';

export interface CameraKeyframe {
  progress: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
}

export interface ZoneDefinition {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  progressStart: number;
  progressEnd: number;
  cameraKeyframe: CameraKeyframe;
  ctaText?: string;
  ctaLink?: string;
}

export interface SpatialProjectNode {
  project: ProjectCaseStudy;
  archetype: VisualArchetype;
  position: [number, number, number];
  rotation: [number, number, number];
}
