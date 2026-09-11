import * as THREE from 'three';
import { CameraKeyframe, ZoneDefinition } from './types';

export const WORLD_ZONES: ZoneDefinition[] = [
  {
    id: 'hero',
    index: '00',
    title: 'TANISHK SINGHAL',
    subtitle: 'Robotics Researcher & Autonomous Systems Engineer',
    description: 'Robotics researcher and systems engineer focusing on autonomous mobile navigation, closed-loop kinematics, embedded firmware, and applied machine learning pipelines.',
    progressStart: 0.0,
    progressEnd: 0.14,
    cameraKeyframe: {
      progress: 0.0,
      position: new THREE.Vector3(0, 1.25, 4.5),
      target: new THREE.Vector3(0.0, 0.1, 0.0),
      fov: 38,
    },
    ctaText: 'Explore Work',
    ctaLink: '/projects',
  },
  {
    id: 'robotics',
    index: '01',
    title: 'Robotics & Manipulation',
    subtitle: '6-DOF Kinematics & Trajectory Generation',
    description: 'Multi-axis serial arm trajectory generation, forward and inverse kinematics solvers, precision joint actuators, and hardware-in-the-loop validation.',
    progressStart: 0.15,
    progressEnd: 0.31,
    cameraKeyframe: {
      progress: 0.23,
      position: new THREE.Vector3(-0.9, 1.25, -12.5),
      target: new THREE.Vector3(1.2, 0.65, -16.0),
      fov: 38,
    },
    ctaText: 'View Robotics Work',
    ctaLink: '/projects',
  },
  {
    id: 'autonomy',
    index: '02',
    title: 'Autonomous Navigation',
    subtitle: 'ROS 2 Nav2 & LiDAR SLAM',
    description: 'Differential-drive mobile robots, real-time 2D/3D LiDAR odometry, costmap generation, dynamic obstacle avoidance, and global/local path planners.',
    progressStart: 0.32,
    progressEnd: 0.47,
    cameraKeyframe: {
      progress: 0.40,
      position: new THREE.Vector3(0.8, 1.20, -26.5),
      target: new THREE.Vector3(-1.4, 0.45, -30.0),
      fov: 38,
    },
    ctaText: 'Explore Autonomy Stack',
    ctaLink: '/projects',
  },
  {
    id: 'aerospace',
    index: '03',
    title: 'Aerospace & Space Systems',
    subtitle: 'UAV Avionics & CubeSat Subsystems',
    description: 'Autonomous quadrotor flight control, target pursuit kinematics, and 3U CubeSat satellite power architecture and telemetry subsystems.',
    progressStart: 0.48,
    progressEnd: 0.63,
    cameraKeyframe: {
      progress: 0.55,
      position: new THREE.Vector3(-0.8, 2.0, -40.5),
      target: new THREE.Vector3(1.2, 1.3, -44.0),
      fov: 38,
    },
    ctaText: 'View Aerospace Work',
    ctaLink: '/projects',
  },
  {
    id: 'research',
    index: '04',
    title: 'Systems & Research',
    subtitle: 'Perception-to-Action Architecture',
    description: 'Closed-loop multi-modal sensor fusion, edge AI/ML tensor optimization, real-time deterministic pipelines, and peer-reviewed technical publications.',
    progressStart: 0.64,
    progressEnd: 0.77,
    cameraKeyframe: {
      progress: 0.70,
      position: new THREE.Vector3(0.5, 1.2, -54.5),
      target: new THREE.Vector3(-1.2, 0.7, -58.0),
      fov: 38,
    },
    ctaText: 'Explore Research',
    ctaLink: '/research',
  },
  {
    id: 'projects',
    index: '05',
    title: 'Featured Projects',
    subtitle: 'Engineering Case Studies & Repositories',
    description: 'Authentic engineering monographs formulating problem statements, subsystem topologies, and verified real-world implementations.',
    progressStart: 0.78,
    progressEnd: 0.91,
    cameraKeyframe: {
      progress: 0.85,
      position: new THREE.Vector3(0.0, 1.6, -68.0),
      target: new THREE.Vector3(0.0, 0.5, -72.0),
      fov: 40,
    },
    ctaText: 'Open All Projects',
    ctaLink: '/projects',
  },
  {
    id: 'contact',
    index: '06',
    title: 'Contact & Collaboration',
    subtitle: 'Direct Channels & Academic Inquiries',
    description: 'Available for advanced robotics research programs, autonomous system engineering, embedded hardware design, and academic inquiries.',
    progressStart: 0.92,
    progressEnd: 1.0,
    cameraKeyframe: {
      progress: 0.96,
      position: new THREE.Vector3(0.0, 1.1, -82.0),
      target: new THREE.Vector3(0.0, 0.7, -86.0),
      fov: 36,
    },
    ctaText: 'Get in Touch',
    ctaLink: '/contact',
  },
];

const KEYFRAMES: CameraKeyframe[] = WORLD_ZONES.map((z) => z.cameraKeyframe);

/**
 * Deterministically interpolates camera position and lookAt target based on continuous scroll progress (0..1).
 */
export function interpolateCameraState(
  progress: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3
): { fov: number; activeZoneIndex: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Find surrounding keyframes
  let idx = 0;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clampedProgress >= KEYFRAMES[i].progress && clampedProgress <= KEYFRAMES[i + 1].progress) {
      idx = i;
      break;
    }
  }

  const k1 = KEYFRAMES[idx];
  const k2 = KEYFRAMES[Math.min(idx + 1, KEYFRAMES.length - 1)];

  const span = k2.progress - k1.progress;
  const localT = span > 0.0001 ? (clampedProgress - k1.progress) / span : 0;
  
  // Smooth hermite / cosine ease for fluid camera traveling
  const smoothT = localT * localT * (3 - 2 * localT);

  outPos.lerpVectors(k1.position, k2.position, smoothT);
  outTarget.lerpVectors(k1.target, k2.target, smoothT);

  const fov1 = k1.fov ?? 38;
  const fov2 = k2.fov ?? 38;
  const fov = fov1 + (fov2 - fov1) * smoothT;

  // Find active zone for typography sync
  let activeZoneIndex = 0;
  for (let i = 0; i < WORLD_ZONES.length; i++) {
    if (clampedProgress >= WORLD_ZONES[i].progressStart && clampedProgress <= WORLD_ZONES[i].progressEnd) {
      activeZoneIndex = i;
      break;
    }
  }

  return { fov, activeZoneIndex };
}
