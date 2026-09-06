import { CopyrightItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const copyrightsData: CopyrightItem[] = [
  // Canonical registry for verified copyright certificates.
  // Unverified/candidate filings remain quarantined until authenticated certificates/registration numbers are provided.
];

export function getProductionCopyrights(): CopyrightItem[] {
  return filterProductionVerified(copyrightsData);
}

export function getAllCandidateCopyrights(): CopyrightItem[] {
  return copyrightsData;
}
