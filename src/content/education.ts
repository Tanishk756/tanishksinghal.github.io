import { EducationItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const educationData: EducationItem[] = [
  {
    id: "lpu-btech-robotics",
    institution: "Lovely Professional University",
    program: "B.Tech, Robotics and Automation",
    degree: "B.Tech, Robotics and Automation",
    startDate: "Aug 2022",
    endDate: "May 2026",
    publicEligibility: true,
    source: "Owner-Supplied LinkedIn Education Screenshot",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-06",
    notes: "Direct evidence from owner-supplied LinkedIn profile."
  },
  {
    id: "bser-senior-secondary",
    institution: "Board of Secondary Education Rajasthan",
    program: "Senior Secondary Education, Student",
    degree: "Senior Secondary Education, Student",
    startDate: "2021",
    endDate: "2022",
    grade: "95.80%",
    publicEligibility: true,
    source: "Owner-Supplied LinkedIn Education Screenshot",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-06",
    notes: "Direct evidence from owner-supplied LinkedIn profile."
  },
  {
    id: "bser-secondary",
    institution: "Board of Secondary Education Rajasthan",
    program: "Secondary Education, Student",
    degree: "Secondary Education, Student",
    startDate: "2019",
    endDate: "2020",
    grade: "94.66%",
    publicEligibility: true,
    source: "Owner-Supplied LinkedIn Education Screenshot",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-06",
    notes: "Direct evidence from owner-supplied LinkedIn profile."
  }
];

export function getProductionEducation(): EducationItem[] {
  return filterProductionVerified(educationData);
}

export function getAllCandidateEducation(): EducationItem[] {
  return educationData;
}

