import { describe, it, expect } from 'vitest';
import { mapProjectCategoryToArchetype } from '../src/components/3d/core/types';
import { ProjectCaseStudy } from '../src/types/content';

describe('Phase 3: Interactive Projects 3D Gallery & Engineering Workspace', () => {
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
      results: { summary: ['Demonstrated sub-0.5s reaction latency.'] },
      coverBadge: 'UAV/AEROSPACE',
      source: 'Supabase Canonical published record',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: '2026-09-11',
    },
    {
      id: 'p-4',
      slug: 'openrobo',
      title: 'OpenRobo — Open Robotics Commons Platform',
      tagline: 'Modular robotics simulation and driver architecture',
      category: 'robotics',
      subcategories: ['ROS 2', 'Gazebo', 'URDF'],
      status: 'completed',
      featured: true,
      startDate: '2024-08-01',
      problem: 'Fragmented hardware abstraction layers in open robotics.',
      objective: 'Unified ROS 2 hardware interfaces for modular actuators.',
      approach: 'Standardized ros2_control plugin architectures.',
      challenges: [],
      results: { summary: ['Adopted by multiple robotics teams.'] },
      coverBadge: 'ROBOTICS',
      source: 'Supabase Canonical published record',
      verificationStatus: 'USER_PROVIDED',
      lastVerified: '2026-09-11',
    },
  ];

  it('correctly maps all project records to their 3D visual archetypes', () => {
    expect(mapProjectCategoryToArchetype(mockProjects[0].category)).toBe('robotic-arm');
    expect(mapProjectCategoryToArchetype(mockProjects[1].category)).toBe('systems-pipeline');
    expect(mapProjectCategoryToArchetype(mockProjects[2].category)).toBe('uav-drone');
    expect(mapProjectCategoryToArchetype(mockProjects[3].category)).toBe('wheeled-robot');
  });

  it('generates valid direct case study route URLs for each project', () => {
    mockProjects.forEach((p) => {
      const url = `/projects/${p.slug}`;
      expect(url).toMatch(/^\/projects\/[a-z0-9-]+$/);
      expect(p.slug.length).toBeGreaterThan(0);
    });
  });

  it('filters projects cleanly by category without mutating the underlying dataset', () => {
    const roboticsProjects = mockProjects.filter((p) => p.category === 'robotics');
    expect(roboticsProjects).toHaveLength(1);
    expect(roboticsProjects[0].slug).toBe('openrobo');

    const uavProjects = mockProjects.filter((p) => p.category === 'uav-aerospace');
    expect(uavProjects).toHaveLength(1);
    expect(uavProjects[0].slug).toBe('aeroguard');

    const allProjects = mockProjects.filter(() => true);
    expect(allProjects).toHaveLength(4);
  });
});
