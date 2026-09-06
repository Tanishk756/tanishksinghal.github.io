import { CertificationItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const certificationsData: CertificationItem[] = [
  // Empty registry: Unverified certifications are quarantined until explicitly provided
];

export function getProductionCertifications(): CertificationItem[] {
  return filterProductionVerified(certificationsData);
}

export function getAllCandidateCertifications(): CertificationItem[] {
  return certificationsData;
}
