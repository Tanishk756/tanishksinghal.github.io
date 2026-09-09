import React from 'react';
import { parseExperienceDate, sortExperiencesDesc } from '../../src/utils/experienceSorting';
import { normalizeExperience } from '../../src/cms/publicContentClient';

const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function verifyPageDataAndSorting() {
  console.log('=== VERIFYING EXPERIENCE PAGE RENDERING & DYNAMIC SORTING ===\n');

  // 1. Fetch live published experiences directly from public endpoint
  const res = await fetch(`${SUPABASE_URL}/functions/v1/public-content?type=experience`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  });
  const json = await res.json();
  console.log('Fetched public experiences count:', json.data?.length);

  const rawList = Array.isArray(json.data) ? json.data : [];
  const normalized = rawList.map(normalizeExperience);
  const sorted = sortExperiencesDesc(normalized);

  console.log('\n--- Live Published Chronology Sequence ---');
  sorted.forEach((exp, idx) => {
    const parsed = parseExperienceDate(exp.startDate);
    const dateLabel = `${exp.startDate || ''} ${exp.endDate ? `— ${exp.endDate}` : '— Present'}`;
    const locationLabel = `${exp.location}${exp.workMode ? ` · ${exp.workMode}` : ''}`.toUpperCase();
    console.log(`[${idx + 1}] ${exp.role} at ${exp.organization}`);
    console.log(`    Date: ${dateLabel} (Parsed Year: ${parsed.year}, Month: ${parsed.month})`);
    console.log(`    Location & Mode: ${locationLabel}`);
  });

  // Verify DronIQ is present, published, has start date "July 2026", and displays "JAMMU, INDIA · ON-SITE"
  const droniq = sorted.find(e => e.organization?.includes('DronIQ'));
  if (!droniq) {
    throw new Error('DronIQ record not found in public chronology!');
  }
  if (droniq.startDate !== 'July 2026') {
    throw new Error(`Expected startDate "July 2026", got "${droniq.startDate}"`);
  }
  const droniqLocationMode = `${droniq.location}${droniq.workMode ? ` · ${droniq.workMode}` : ''}`.toUpperCase();
  if (droniqLocationMode !== 'JAMMU, INDIA · ON-SITE') {
    throw new Error(`Expected "JAMMU, INDIA · ON-SITE", got "${droniqLocationMode}"`);
  }
  console.log('\n✅ DronIQ Labs role verified: "JAMMU, INDIA · ON-SITE", "July 2026"');

  // Verify multiple dynamic insertions & sorting behaviors:
  console.log('\n--- Verifying Dynamic Chronological Ingestion & Insertion ---');
  const dynamicPool = [
    { id: '1', organization: 'Nov 2023 Corp', role: 'Dev', startDate: 'November 2023' },
    { id: '2', organization: 'Jul 2026 Corp', role: 'Lead', startDate: 'July 2026' },
    { id: '3', organization: 'Aug 2023 Corp', role: 'Intern', startDate: 'August 2023' },
    { id: '4', organization: 'Jun 2024 Corp', role: 'Senior', startDate: 'June 2024' },
    { id: '5', organization: 'Aug 2025 Corp', role: 'Staff', startDate: 'August 2025' },
    { id: '6', organization: 'Apr 2025 Corp', role: 'Principal', startDate: 'April 2025' },
    { id: '7', organization: 'Jan 2027 Corp', role: 'CTO', startDate: 'January 2027' },
    { id: '8', organization: 'Sep 2024 Corp', role: 'Architect', startDate: 'September 2024' },
  ];

  const sortedPool = sortExperiencesDesc(dynamicPool);
  const expectedPoolOrder = [
    'Jan 2027 Corp',
    'Jul 2026 Corp',
    'Aug 2025 Corp',
    'Apr 2025 Corp',
    'Sep 2024 Corp',
    'Jun 2024 Corp',
    'Nov 2023 Corp',
    'Aug 2023 Corp',
  ];

  const actualPoolOrder = sortedPool.map(e => e.organization);
  console.log('Dynamic Pool Output:\n ' + actualPoolOrder.join('\n -> '));

  if (JSON.stringify(actualPoolOrder) !== JSON.stringify(expectedPoolOrder)) {
    throw new Error(`Pool sorting mismatch: ${JSON.stringify(actualPoolOrder)}`);
  }
  console.log('\n✅ Dynamic chronological sequence strictly verified.');
}

verifyPageDataAndSorting().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
