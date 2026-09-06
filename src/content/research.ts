import { ResearchItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const researchData: ResearchItem[] = [
  {
    id: "autonomous-kinematic-control",
    slug: "autonomous-kinematic-control",
    title: "Closed-Loop Kinematics & Heading Tracking in ROS 2",
    domain: "Robotics Kinematics Study",
    organization: "Open Source Implementation",
    collaborators: ["Tanishk Singhal"],
    dateRange: "2024",
    summary: "Implementation study on proportional steering control, angle normalization across quadrant boundaries, and asynchronous node communication in ROS 2.",
    methodology: "Implemented heading error calculations and quadrant angle normalization in Python node scripts, tested across simulation runs in turtlesim.",
    contributions: [
      "Implemented decoupled subscriber and publisher nodes using ROS 2 geometry_msgs.",
      "Handled angle wrap-around discontinuities through (-pi, pi] interval normalization.",
      "Tested follower convergence behavior during target motion."
    ],
    source: "GitHub Account Tanishk756 Repositories",
    sourceUrl: "https://github.com/tanishk756/turtle_chase",
    verificationStatus: "GITHUB_VERIFIED",
    lastVerified: "2026-09-05"
  },
  {
    id: "graph-path-planning-perception",
    slug: "graph-path-planning-perception",
    title: "Graph Search Algorithms & 2D Grid Traversal",
    domain: "Algorithmic Search Study",
    organization: "Open Source Implementation",
    collaborators: ["Tanishk Singhal"],
    dateRange: "2024",
    summary: "Comparative implementation of deterministic graph-search algorithms (A* heuristic search vs Dijkstra uniform cost) on discrete 2D grid representations.",
    methodology: "Implemented 8-connected grid search in Python using priority queues with Manhattan and Euclidean distance heuristics.",
    contributions: [
      "Demonstrated A* heuristic pruning compared to uniform-cost Dijkstra search on synthetic 2D grids.",
      "Implemented diagonal cost weighting for 8-connected neighbor exploration."
    ],
    source: "GitHub Account Tanishk756",
    sourceUrl: "https://github.com/tanishk756",
    verificationStatus: "GITHUB_VERIFIED",
    lastVerified: "2026-09-05"
  },
  {
    id: "uav-energy-harvesting-research",
    slug: "uav-energy-harvesting-research",
    title: "Multi-Source Wireless Energy Harvesting Architectures for Autonomous UAVs",
    domain: "Aerospace Systems & UAV Endurance",
    organization: "Lovely Professional University",
    collaborators: ["MK Shukla", "HS Bedi", "YK Verma", "Tanishk Singhal"],
    dateRange: "2025 — 2026",
    summary: "Theoretical framework and simulation of hybrid energy harvesting (RF, photovoltaic, and ambient scavenging) to supplement onboard battery reserves in autonomous drone systems.",
    methodology: "Energy budget modeling and power transfer efficiency analysis across diverse flight profiles and RF transmitter topologies.",
    contributions: [
      "Formulated mathematical models for multi-source energy scavenging during station-keeping flight modes."
    ],
    associatedPublicationSlugs: ["uav-wireless-power-harvesting"],
    source: "Google Scholar & ResearchGate Candidate Records",
    sourceUrl: "https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en",
    verificationStatus: "PROBABLE",
    lastVerified: "2026-09-05",
    notes: "Awaiting final user review before public rendering."
  }
];

export function getProductionResearch(): ResearchItem[] {
  return filterProductionVerified(researchData);
}

export function getAllCandidateResearch(): ResearchItem[] {
  return researchData;
}
