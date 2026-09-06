import { ProvenanceRecord } from '../types/content';

/**
 * Filter to ensure only USER_PROVIDED, GITHUB_VERIFIED, and PUBLIC_WEB_VERIFIED
 * items enter production displays. Items marked PROBABLE or UNVERIFIED are quarantined.
 */
export function isProductionVerified<T extends ProvenanceRecord & { publicEligibility?: boolean }>(item: T): boolean {
  if (item.publicEligibility === false) {
    return false;
  }
  return (
    item.verificationStatus === 'USER_PROVIDED' ||
    item.verificationStatus === 'GITHUB_VERIFIED' ||
    item.verificationStatus === 'PUBLIC_WEB_VERIFIED'
  );
}

export function filterProductionVerified<T extends ProvenanceRecord & { publicEligibility?: boolean }>(items: T[]): T[] {
  return items.filter(isProductionVerified);
}
