import { CurrentlyBuildingItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const currentlyBuildingData: CurrentlyBuildingItem[] = [
  {
    id: "active-uav-autonomy",
    title: "Multi-Agent UAV & Autonomous Systems Navigation Stack",
    category: "Autonomous Systems & Robotics",
    status: "active-development",
    description: "Architecting a modular 3D pursuit and spatial trajectory planner built on ROS 2 with dynamic obstacle avoidance in GPS-denied synthetic environments.",
    currentMilestone: "Refining 3D vector field pursuit math and trajectory smoothing.",
    technologies: ["ROS 2", "Python", "3D Kinematics", "Kalman Filtering", "Perception"],
    source: "User Workspace & Primary Focus",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-05",
    notes: "Active engineering research initiative."
  },
  {
    id: "edge-ml-perception",
    title: "Embedded Edge Vision & Spatial Feature Extractor",
    category: "AI / Computer Vision",
    status: "prototyping",
    description: "Developing lightweight computer vision feature pipelines optimized for low-latency robotic obstacle tracking on constrained hardware.",
    currentMilestone: "Benchmarking frame-rate latency vs accuracy trade-offs.",
    technologies: ["Python", "OpenCV", "Scikit-Learn", "Edge Compute"],
    source: "User Workspace & Primary Focus",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-05",
    notes: "Active perception pipeline work."
  }
];

export function getProductionCurrentlyBuilding(): CurrentlyBuildingItem[] {
  return filterProductionVerified(currentlyBuildingData);
}
