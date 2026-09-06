import { ExperienceItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const experienceData: ExperienceItem[] = [
  {
    id: "droniq-labs-robotics-ai-engineer",
    slug: "droniq-labs-robotics-ai-engineer",
    organization: "DronIQ Labs Pvt Ltd",
    role: "Robotics and AI Engineer",
    type: "EMPLOYMENT",
    startDate: "July 2026",
    endDate: "Present",
    current: true,
    isCurrent: true,
    location: "Jammu",
    workMode: "On-site",
    domain: "Robotics & AI",
    description: [],
    source: "Direct owner confirmation in current conversation",
    verificationStatus: "USER_PROVIDED",
    publicEligibility: true,
    lastVerified: "2026-09-06",
    notes: "Direct owner-confirmed employment record."
  },
  {
    id: "figuredoutai-leadership",
    slug: "figuredoutai-leadership",
    role: "Co-Founder & CEO",
    organization: "FiguredoutAI",
    type: "FOUNDER",
    organizationUrl: "https://figuredoutai.com",
    startDate: "2024",
    endDate: "Present",
    current: true,
    isCurrent: true,
    domain: "AI & Technology Ventures",
    description: [
      "Co-founder leadership role directing technical strategy and product architecture."
    ],
    technologies: ["AI/ML", "Systems Architecture"],
    source: "ResearchGate & Public Profile Mentions",
    verificationStatus: "PROBABLE",
    publicEligibility: false,
    lastVerified: "2026-09-06",
    notes: "Awaiting owner confirmation regarding legal entity structure, role title, and timeline."
  },
  {
    id: "stac-lpu-leadership",
    slug: "stac-lpu-leadership",
    role: "Technical Head",
    organization: "Space Tech & Astro Community (STAC)",
    type: "STUDENT_ORGANIZATION",
    startDate: "2023",
    endDate: "2024",
    current: false,
    isCurrent: false,
    domain: "Aerospace & Technical Community",
    description: [
      "Technical leadership in student community projects and workshops."
    ],
    technologies: ["Avionics", "Robotics", "Community Leadership"],
    source: "Student Community Public Directory",
    verificationStatus: "PROBABLE",
    publicEligibility: false,
    lastVerified: "2026-09-06",
    notes: "Awaiting owner confirmation of exact community title and date range."
  },
  {
    id: "open-source-robotics-research",
    slug: "open-source-robotics-research",
    role: "Systems Developer & Researcher",
    organization: "Independent Open Source Robotics",
    type: "RESEARCH_COLLABORATION",
    organizationUrl: "https://github.com/tanishk756",
    startDate: "2023",
    endDate: "Present",
    current: true,
    isCurrent: true,
    domain: "Robotics & Autonomy",
    description: [
      "Engineered ROS 2 multi-node packages for autonomous mobile robotics, real-time closed-loop control, and deterministic spatial path planning.",
      "Maintained public open-source repositories and reproducible documentation."
    ],
    technologies: ["ROS 2", "Python", "C++", "Kinematics", "Linux", "Git"],
    source: "GitHub Account Tanishk756 Repositories",
    sourceUrl: "https://github.com/tanishk756",
    verificationStatus: "PROBABLE",
    publicEligibility: false,
    lastVerified: "2026-09-06",
    notes: "GitHub repositories verify code existence; categorized as research collaboration rather than formal employment. Awaiting owner review for timeline inclusion."
  }
];

export function getProductionExperience(): ExperienceItem[] {
  return filterProductionVerified(experienceData);
}

export function getAllCandidateExperience(): ExperienceItem[] {
  return experienceData;
}
