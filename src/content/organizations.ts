import { OrganizationItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const organizationsData: OrganizationItem[] = [
  {
    id: "droniq-labs",
    name: "DronIQ Labs Pvt Ltd",
    type: "company",
    role: "Robotics and AI Engineer",
    relationshipType: "EMPLOYMENT",
    dateRange: "July 2026 — Present",
    startDate: "July 2026",
    source: "Direct owner confirmation in current conversation",
    verificationStatus: "USER_PROVIDED",
    publicEligibility: true,
    lastVerified: "2026-09-06",
    notes: "Direct owner-confirmed organizational relationship."
  },
  {
    id: "figuredoutai",
    name: "FiguredoutAI",
    type: "startup",
    role: "Co-Founder & CEO",
    relationshipType: "FOUNDER",
    dateRange: "2024 — Present",
    startDate: "2024",
    websiteUrl: "https://figuredoutai.com",
    description: "Technology & AI venture.",
    source: "ResearchGate & Public Registry Profile",
    verificationStatus: "PROBABLE",
    publicEligibility: false,
    lastVerified: "2026-09-06",
    notes: "Awaiting owner confirmation regarding organization entity status and role representation."
  },
  {
    id: "stac-lpu",
    name: "Space Tech & Astro Community (STAC)",
    type: "student-society",
    role: "Technical Head",
    relationshipType: "STUDENT_ORGANIZATION",
    dateRange: "2023 — 2024",
    startDate: "2023",
    endDate: "2024",
    description: "Student aerospace and astronomy technical community.",
    source: "Public Student Organization Records",
    verificationStatus: "PROBABLE",
    publicEligibility: false,
    lastVerified: "2026-09-06",
    notes: "Awaiting owner confirmation before public display."
  }
];

export function getProductionOrganizations(): OrganizationItem[] {
  return filterProductionVerified(organizationsData);
}

export function getAllCandidateOrganizations(): OrganizationItem[] {
  return organizationsData;
}
