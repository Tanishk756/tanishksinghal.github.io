import { AchievementItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const achievementsData: AchievementItem[] = [
  // Empty registry: Unverified claims are quarantined until explicitly provided by user
];

export function getProductionAchievements(): AchievementItem[] {
  return filterProductionVerified(achievementsData);
}

export function getAllCandidateAchievements(): AchievementItem[] {
  return achievementsData;
}
