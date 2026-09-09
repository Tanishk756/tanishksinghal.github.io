import { parseExperienceDate, compareExperiencesDesc, sortExperiencesDesc } from '../../src/utils/experienceSorting';
import { normalizeExperience } from '../../src/cms/publicContentClient';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✅ ${msg}`);
}

export function runExperienceSortingTests() {
  console.log('=== RUNNING COMPREHENSIVE EXPERIENCE SORTING TESTS ===\n');

  // 1. Month / Year parsing accuracy across all 12 months & formats
  const testDates = [
    { input: 'July 2026', expectedYear: 2026, expectedMonth: 7 },
    { input: 'August 2025', expectedYear: 2025, expectedMonth: 8 },
    { input: 'April 2025', expectedYear: 2025, expectedMonth: 4 },
    { input: 'June 2024', expectedYear: 2024, expectedMonth: 6 },
    { input: 'November 2023', expectedYear: 2023, expectedMonth: 11 },
    { input: 'August 2023', expectedYear: 2023, expectedMonth: 8 },
    { input: 'Jan 2027', expectedYear: 2027, expectedMonth: 1 },
    { input: 'February 2024', expectedYear: 2024, expectedMonth: 2 },
    { input: 'March 2025', expectedYear: 2025, expectedMonth: 3 },
    { input: 'May 2024', expectedYear: 2024, expectedMonth: 5 },
    { input: 'Sept 2024', expectedYear: 2024, expectedMonth: 9 },
    { input: 'October 2022', expectedYear: 2022, expectedMonth: 10 },
    { input: 'Dec 2021', expectedYear: 2021, expectedMonth: 12 },
    { input: '2024', expectedYear: 2024, expectedMonth: 1 },
    { input: '2025-09-15', expectedYear: 2025, expectedMonth: 9 },
    { input: 'July 2026 — Present', expectedYear: 2026, expectedMonth: 7 },
  ];

  for (const td of testDates) {
    const parsed = parseExperienceDate(td.input);
    assert(
      parsed.isValid && parsed.year === td.expectedYear && parsed.month === td.expectedMonth,
      `Parsed "${td.input}" correctly as Year=${td.expectedYear}, Month=${td.expectedMonth}`
    );
  }

  // 2. Multiple experiences across different years/months sorted descending
  const rawList = [
    { id: '1', organization: 'Org Nov 2023', startDate: 'November 2023' },
    { id: '2', organization: 'Org Jul 2026', startDate: 'July 2026' },
    { id: '3', organization: 'Org Aug 2023', startDate: 'August 2023' },
    { id: '4', organization: 'Org Jun 2024', startDate: 'June 2024' },
    { id: '5', organization: 'Org Aug 2025', startDate: 'August 2025' },
    { id: '6', organization: 'Org Apr 2025', startDate: 'April 2025' },
  ];

  const sortedList = sortExperiencesDesc(rawList);
  const expectedOrder = ['Org Jul 2026', 'Org Aug 2025', 'Org Apr 2025', 'Org Jun 2024', 'Org Nov 2023', 'Org Aug 2023'];
  const actualOrder = sortedList.map(e => e.organization);
  assert(
    JSON.stringify(actualOrder) === JSON.stringify(expectedOrder),
    `Sorted canonical experience sequence: ${actualOrder.join(' > ')}`
  );

  // 3. Two experiences in the same month/year uses secondary tie breaker
  const sameMonthList = [
    { id: 'b', organization: 'Company B', startDate: 'August 2023', displayOrder: 2 },
    { id: 'a', organization: 'Company A', startDate: 'August 2023', displayOrder: 1 },
  ];
  const sortedSameMonth = sortExperiencesDesc(sameMonthList);
  assert(
    sortedSameMonth[0].organization === 'Company A' && sortedSameMonth[1].organization === 'Company B',
    'Tie-breaker on same month/year resolves deterministically via displayOrder'
  );

  // 4. Adding a newer experience automatically places it first
  const withNewer = sortExperiencesDesc([
    ...rawList,
    { id: 'new-1', organization: 'New Future Corp', startDate: 'January 2027' }
  ]);
  assert(
    withNewer[0].organization === 'New Future Corp',
    'Adding future experience "January 2027" automatically positions it at index 0 (first)'
  );

  // 5. Adding an older experience automatically places it last
  const withOlder = sortExperiencesDesc([
    ...rawList,
    { id: 'old-1', organization: 'Ancient Lab', startDate: 'May 2020' }
  ]);
  assert(
    withOlder[withOlder.length - 1].organization === 'Ancient Lab',
    'Adding older experience "May 2020" automatically positions it at final index (last)'
  );

  // 6. Adding an experience between existing dates automatically inserts it in correct middle position
  const withMiddle = sortExperiencesDesc([
    ...rawList,
    { id: 'mid-1', organization: 'Mid Sept 2024', startDate: 'September 2024' }
  ]);
  const midIndex = withMiddle.findIndex(e => e.organization === 'Mid Sept 2024');
  assert(
    withMiddle[midIndex - 1].organization === 'Org Apr 2025' &&
    withMiddle[midIndex + 1].organization === 'Org Jun 2024',
    'Adding "September 2024" correctly slots between "April 2025" and "June 2024"'
  );

  // 7. Editing an existing start_date dynamically moves it to new position
  const editedList = rawList.map(e => e.organization === 'Org Aug 2023' ? { ...e, startDate: 'March 2026' } : e);
  const sortedEdited = sortExperiencesDesc(editedList);
  const editedIdx = sortedEdited.findIndex(e => e.organization === 'Org Aug 2023');
  assert(
    editedIdx === 1 && sortedEdited[0].organization === 'Org Jul 2026' && sortedEdited[2].organization === 'Org Aug 2025',
    'Editing "August 2023" to "March 2026" shifts position to index 1 (between July 2026 and August 2025)'
  );

  // 8. Deleting an experience preserves correct chronological ordering
  const withDeleted = sortExperiencesDesc(rawList.filter(e => e.organization !== 'Org Jun 2024'));
  const deletedExpected = ['Org Jul 2026', 'Org Aug 2025', 'Org Apr 2025', 'Org Nov 2023', 'Org Aug 2023'];
  assert(
    JSON.stringify(withDeleted.map(e => e.organization)) === JSON.stringify(deletedExpected),
    'Deleting an intermediate experience preserves strict chronological descending sequence'
  );

  // 9. Invalid / missing / "Present" start dates do not throw and sort safely at end
  const invalidList = [
    { id: 'inv-1', organization: 'Invalid Null', startDate: null as any },
    { id: 'inv-2', organization: 'Invalid Present', startDate: 'Present' },
    { id: 'inv-3', organization: 'Invalid String', startDate: 'Unknown Date' },
    { id: 'valid-1', organization: 'Valid Exp', startDate: 'June 2024' },
  ];
  const sortedInvalid = sortExperiencesDesc(invalidList);
  assert(
    sortedInvalid[0].organization === 'Valid Exp',
    'Valid date precedes invalid/null/"Present" start dates safely without errors'
  );
  assert(
    parseExperienceDate('Present').isValid === false,
    '"Present" is rejected as a start date'
  );

  // 10. Large collection (30+ generated records across 10 years) strictly sorted descending
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const generated: any[] = [];
  for (let year = 2018; year <= 2028; year++) {
    for (let m = 0; m < 12; m += 3) {
      generated.push({
        id: `gen-${year}-${m}`,
        organization: `Company ${year} ${months[m]}`,
        startDate: `${months[m]} ${year}`,
      });
    }
  }
  // Shuffle array
  const shuffled = [...generated].sort(() => Math.random() - 0.5);
  const sortedGen = sortExperiencesDesc(shuffled);

  let isStrictlySorted = true;
  for (let i = 0; i < sortedGen.length - 1; i++) {
    const tA = parseExperienceDate(sortedGen[i].startDate).timestamp;
    const tB = parseExperienceDate(sortedGen[i + 1].startDate).timestamp;
    if (tA < tB) {
      isStrictlySorted = false;
      break;
    }
  }
  assert(
    isStrictlySorted && sortedGen.length === generated.length,
    `30+ generated randomized experiences strictly verified in descending order from ${sortedGen[0].startDate} to ${sortedGen[sortedGen.length - 1].startDate}`
  );

  console.log('\n🎉 ALL EXPERIENCE SORTING UNIT & INTEGRATION TESTS PASSED!');
}

runExperienceSortingTests();
