const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

const PROBE_COLUMNS = [
  'id',
  'slug',
  'title',
  'name',
  'domain',
  'research_area',
  'area',
  'category',
  'summary',
  'description',
  'problem',
  'problem_statement',
  'research_question',
  'methodology',
  'algorithms',
  'key_contribution',
  'contributions',
  'status',
  'research_status',
  'collaborators',
  'co_authors',
  'display_order',
  'publication_status',
  'verification_status',
  'verification_notes',
  'evidence_url',
  'source',
  'source_url',
  'last_verified',
  'created_at',
  'updated_at',
];

async function probeColumns() {
  console.log('=== PROBING LIVE research_programs COLUMNS ===');
  const existingCols: string[] = [];
  const missingCols: string[] = [];

  for (const col of PROBE_COLUMNS) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/research_programs?select=${col}&limit=1`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });
    if (res.ok) {
      existingCols.push(col);
    } else {
      const err = await res.json();
      missingCols.push(`${col} (${err.message})`);
    }
  }

  console.log('\n--- EXISTING COLUMNS IN LIVE DATABASE ---');
  existingCols.forEach(c => console.log('  ✔', c));

  console.log('\n--- MISSING COLUMNS ---');
  missingCols.forEach(c => console.log('  ✖', c));
}

probeColumns().catch(console.error);
