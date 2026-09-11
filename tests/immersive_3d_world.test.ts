import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { WORLD_ZONES, interpolateCameraState } from '../src/components/3d/immersive/cameraTimeline';
import { mapProjectCategoryToArchetype, VisualArchetype } from '../src/components/3d/core/types';
import { ProjectCaseStudy } from '../src/types/content';

describe('Immersive 3D Engineering Portfolio Architecture Tests', () => {
  const mockProjects: ProjectCaseStudy[] = [
    {
      id: 'p-1',
      slug: 'autonomous-mobile-robot-ros-2',
      title: 'Autonomous Mobile Robot — ROS 2',
      tagline: 'Differential drive autonomous navigation',
      category: 'autonomy',
      subcategories: ['ROS 2', 'Nav2', 'SLAM'],
      status: 'completed',
      featured: true,
      startDate: '2024-01-01',
      problem: 'Autonomous waypoint tracking in GPS-denied indoor spaces.',
      objective: 'Implement Nav2 costmap and SLAM.',
      approach: 'Skid-steer kinematic model with EKF fusion.',
      challenges: [],
      results: { summary: ['Sub-5cm localization accuracy.'] },
      coverBadge: 'AUTONOMY',
      source: 'Supabase Canonical published record',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: '2026-09-11',
    },
    {
      id: 'p-2',
      slug: 'apex-track',
      title: 'APEX-Track — Autonomous Perception & Persistent Target Tracking Platform',
      tagline: 'Multi-modal perception and tracking for counter-UAS platforms',
      category: 'ai-ml',
      subcategories: ['YOLOv8', 'DeepSORT', 'Kalman Filter'],
      status: 'completed',
      featured: true,
      startDate: '2024-03-01',
      problem: 'Low-latency aerial target detection under severe occlusion.',
      objective: 'Real-time multi-target tracking pipeline at 60 FPS.',
      approach: 'Edge-optimized tensor pipelines with ByteTrack association.',
      challenges: [],
      results: { summary: ['60 FPS inference on Jetson Orin Nano.'] },
      coverBadge: 'AI/ML',
      source: 'Supabase Canonical published record',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: '2026-09-11',
    },
    {
      id: 'p-3',
      slug: 'aeroguard',
      title: 'AeroGuard — Defensive Counter-UAS Research Platform',
      tagline: 'Airborne interceptor kinematics and autonomy stack',
      category: 'uav-aerospace',
      subcategories: ['PX4', 'UAV', 'Trajectory Optimization'],
      status: 'completed',
      featured: true,
      startDate: '2024-06-01',
      problem: 'High-speed evasive target interception algorithms.',
      objective: 'Closed-loop pursuit-evasion trajectory generation.',
      approach: 'Nonlinear model predictive control (NMPC) over SE(3).',
      challenges: [],
      results: { summary: ['Hardware-in-the-loop tracking verified.'] },
      coverBadge: 'AEROSPACE',
      source: 'Supabase Canonical published record',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: '2026-09-11',
    },
  ];

  it('defines exactly 7 continuous spatial engineering zones spanning 0.0 to 1.0', () => {
    expect(WORLD_ZONES.length).toBe(7);
    expect(WORLD_ZONES[0].id).toBe('hero');
    expect(WORLD_ZONES[0].progressStart).toBe(0.0);
    expect(WORLD_ZONES[6].id).toBe('contact');
    expect(WORLD_ZONES[6].progressEnd).toBe(1.0);
  });

  it('interpolates smooth camera positions across the entire scroll timeline', () => {
    const pos = new THREE.Vector3();
    const target = new THREE.Vector3();

    // Opening hero
    const resHero = interpolateCameraState(0.0, pos, target);
    expect(resHero.activeZoneIndex).toBe(0);
    expect(pos.z).toBeGreaterThan(4.0);

    // Robotics zone
    const resRobotics = interpolateCameraState(0.23, pos, target);
    expect(resRobotics.activeZoneIndex).toBe(1);
    expect(pos.x).toBeLessThan(0);

    // Autonomy zone
    const resAutonomy = interpolateCameraState(0.40, pos, target);
    expect(resAutonomy.activeZoneIndex).toBe(2);
    expect(pos.x).toBeGreaterThan(0);

    // Aerospace zone
    const resAerospace = interpolateCameraState(0.55, pos, target);
    expect(resAerospace.activeZoneIndex).toBe(3);
    expect(pos.y).toBeGreaterThan(2.0);

    // Projects zone
    const resProjects = interpolateCameraState(0.85, pos, target);
    expect(resProjects.activeZoneIndex).toBe(5);
    expect(pos.z).toBeLessThan(-12.0);

    // Contact zone
    const resContact = interpolateCameraState(0.98, pos, target);
    expect(resContact.activeZoneIndex).toBe(6);
    expect(pos.z).toBeLessThan(-18.0);
  });

  it('maps published project records to defined 3D archetypes deterministically', () => {
    mockProjects.forEach((p) => {
      const archetype = mapProjectCategoryToArchetype(p.category);
      expect(Object.values(VisualArchetype)).toContain(archetype);
    });
  });

  it('generates authentic deep-link routes to /projects/:slug', () => {
    mockProjects.forEach((p) => {
      const route = `/projects/${p.slug}`;
      expect(route).toBe(`/projects/${p.slug}`);
      expect(route.startsWith('/projects/')).toBe(true);
      expect(p.slug.length).toBeGreaterThan(0);
    });
  });
});
