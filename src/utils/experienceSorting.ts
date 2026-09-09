/**
 * Experience Chronological Sorting Utility
 * 
 * Provides dynamic, robust start-date sorting for Engineering Chronology / Experience items.
 * - Primary: Start Date Descending (Newest start date first -> Oldest start date last)
 * - Robust parsing for full/abbreviated months across all years (e.g. "July 2026", "August 2025")
 * - Handles ISO dates, year-only strings, and ignores "Present" in start dates.
 * - Secondary Tie-breakers: display_order -> created_at -> id
 */

export interface ParsedExperienceDate {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  isValid: boolean;
  raw: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
  spring: 3,
  summer: 6,
  fall: 9,
  autumn: 9,
  winter: 12,
  q1: 1,
  q2: 4,
  q3: 7,
  q4: 10,
};

/**
 * Parses any supported start_date / startDate string into a normalized chronological timestamp.
 */
export function parseExperienceDate(input: any): ParsedExperienceDate {
  if (input === null || input === undefined) {
    return { year: -1, month: 0, day: 0, timestamp: -1, isValid: false, raw: '' };
  }

  const raw = String(input).trim();
  if (!raw) {
    return { year: -1, month: 0, day: 0, timestamp: -1, isValid: false, raw };
  }

  // Reject standalone non-date terms like "Present", "Current", etc.
  const lowerFull = raw.toLowerCase();
  if (['present', 'current', 'now', 'ongoing', 'tbd', 'unknown', 'null', 'undefined', 'none'].includes(lowerFull)) {
    return { year: -1, month: 0, day: 0, timestamp: -1, isValid: false, raw };
  }

  // If a range separator is present (e.g., "July 2026 — Present", "July 2026 - 2027", "2023 - Present"), isolate the start part
  const startSegment = raw.split(/\s*(?:—|–|\s+-\s+|\bto\b|\buntil\b)\s*/i)[0].trim();
  if (!startSegment) {
    return { year: -1, month: 0, day: 0, timestamp: -1, isValid: false, raw };
  }

  const lower = startSegment.toLowerCase().replace(/,/g, ' ');

  // 1. Match 4-digit Year (1900-2199)
  const yearMatch = lower.match(/\b(19\d{2}|20\d{2}|21\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // 2. Match Month name / abbreviation
  let month: number | null = null;
  const words = lower.replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  for (const w of words) {
    if (MONTH_MAP[w]) {
      month = MONTH_MAP[w];
      break;
    }
  }

  // 3. Optional Day (1-31)
  let day = 1;
  const dayMatch = lower.match(/\b([1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\b/);
  if (dayMatch && (!yearMatch || dayMatch[1] !== yearMatch[1])) {
    const candidateDay = parseInt(dayMatch[1], 10);
    if (candidateDay >= 1 && candidateDay <= 31 && (!year || candidateDay !== year)) {
      day = candidateDay;
    }
  }

  // 4. Token match with Year and Month
  if (year !== null && month !== null) {
    const timestamp = Date.UTC(year, month - 1, day);
    return { year, month, day, timestamp, isValid: true, raw };
  }

  // 5. ISO format match: YYYY-MM-DD or YYYY-MM
  const isoMatch = lower.match(/^(\d{4})[-/.](0?[1-9]|1[0-2])(?:[-/.](0?[1-9]|[12]\d|3[01]))?$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
    const timestamp = Date.UTC(y, m - 1, d);
    return { year: y, month: m, day: d, timestamp, isValid: true, raw };
  }

  // 6. MM/YYYY numeric format
  const slashMatch = lower.match(/^(0?[1-9]|1[0-2])[-/.](\d{4})$/);
  if (slashMatch) {
    const m = parseInt(slashMatch[1], 10);
    const y = parseInt(slashMatch[2], 10);
    const timestamp = Date.UTC(y, m - 1, 1);
    return { year: y, month: m, day: 1, timestamp, isValid: true, raw };
  }

  // 7. Year-only match (e.g. "2026")
  if (year !== null) {
    const timestamp = Date.UTC(year, 0, 1);
    return { year, month: 1, day: 1, timestamp, isValid: true, raw };
  }

  // 8. General Date.parse fallback
  const parsedMs = Date.parse(startSegment);
  if (!isNaN(parsedMs)) {
    const d = new Date(parsedMs);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dayVal = d.getUTCDate();
    return { year: y, month: m, day: dayVal, timestamp: parsedMs, isValid: true, raw };
  }

  // Invalid date fallback
  return { year: -1, month: 0, day: 0, timestamp: -1, isValid: false, raw };
}

/**
 * Deterministic comparator for experience items:
 * 1. Primary: Start Date DESCENDING (newest start date first)
 * 2. Secondary: exact raw start date
 * 3. Secondary: display_order (ascending)
 * 4. Secondary: created_at (descending)
 * 5. Secondary: id (lexicographical)
 */
export function compareExperiencesDesc<T extends { startDate?: string; start_date?: string; displayOrder?: number; display_order?: number; createdAt?: string; created_at?: string; id?: string }>(
  a: T,
  b: T
): number {
  const parsedA = parseExperienceDate(a.startDate || a.start_date);
  const parsedB = parseExperienceDate(b.startDate || b.start_date);

  // Valid dates come before invalid / missing dates
  if (parsedA.isValid && !parsedB.isValid) return -1;
  if (!parsedA.isValid && parsedB.isValid) return 1;

  // Primary: Chronological Start Date Descending
  if (parsedA.timestamp !== parsedB.timestamp) {
    return parsedB.timestamp - parsedA.timestamp;
  }

  // Secondary Tie-breaker 1: exact raw start date string
  const rawA = String(a.startDate || a.start_date || '').trim();
  const rawB = String(b.startDate || b.start_date || '').trim();
  if (rawA && rawB && rawA !== rawB) {
    return rawA.localeCompare(rawB);
  }

  // Secondary Tie-breaker 2: display_order ascending
  const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : (typeof a.display_order === 'number' ? a.display_order : 0);
  const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : (typeof b.display_order === 'number' ? b.display_order : 0);
  if (orderA !== orderB) {
    return orderA - orderB;
  }

  // Secondary Tie-breaker 3: created_at descending
  const createdA = String(a.createdAt || a.created_at || '');
  const createdB = String(b.createdAt || b.created_at || '');
  if (createdA && createdB && createdA !== createdB) {
    return createdB.localeCompare(createdA);
  }

  // Final fallback: id
  const idA = String(a.id || '');
  const idB = String(b.id || '');
  return idA.localeCompare(idB);
}

/**
 * Returns a new array of experience items sorted chronologically by start date descending.
 */
export function sortExperiencesDesc<T extends { startDate?: string; start_date?: string; displayOrder?: number; display_order?: number; createdAt?: string; created_at?: string; id?: string }>(
  items: T[]
): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort(compareExperiencesDesc);
}
