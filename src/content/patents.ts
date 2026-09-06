import { PatentItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const patentsData: PatentItem[] = [
  // Empty registry: No unverified or placeholder patents are published
];

export function getProductionPatents(): PatentItem[] {
  return filterProductionVerified(patentsData);
}

export function getAllCandidatePatents(): PatentItem[] {
  return patentsData;
}
