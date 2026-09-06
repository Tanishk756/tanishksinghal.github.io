import { LanguageItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const languagesData: LanguageItem[] = [
  {
    id: "english",
    language: "English",
    proficiency: "professional",
    source: "Technical documentation & research authoring",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-05"
  },
  {
    id: "hindi",
    language: "Hindi",
    proficiency: "native",
    source: "Identity Profile",
    verificationStatus: "USER_PROVIDED",
    lastVerified: "2026-09-05"
  }
];

export function getProductionLanguages(): LanguageItem[] {
  return filterProductionVerified(languagesData);
}

export function getAllCandidateLanguages(): LanguageItem[] {
  return languagesData;
}
