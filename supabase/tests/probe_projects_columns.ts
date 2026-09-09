const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

const CANDIDATE_COLUMNS = [
  'id',
  'slug',
  'title',
  'subtitle',
  'tagline',
  'overview',
  'category',
  'subcategory',
  'subcategories',
  'status',
  'featured',
  'timeframe',
  'start_date',
  'end_date',
  'role',
  'organization',
  'company',
  'cover_image',
  'cover_badge',
  'coverImage',
  'coverBadge',
  'problem',
  'objective',
  'solution',
  'approach',
  'architecture',
  'subsystems',
  'hardware_specs',
  'hardwareStack',
  'software_stack',
  'softwareStack',
  'algorithms',
  'challenges',
  'results',
  'limitations',
  'lessons_learned',
  'lessonsLearned',
  'future_work',
  'futureWork',
  'github_url',
  'githubUrl',
  'demo_url',
  'demoUrl',
  'docs_url',
  'docsUrl',
  'paper_url',
  'paperUrl',
  'media_gallery',
  'display_order',
  'publication_status',
  'verification_status',
  'verification_notes',
  'evidence_url',
  'last_verified',
  'created_at',
  'updated_at',
];

async function probeColumns() {
  console.log('=== PROBING LIVE projects COLUMNS ===');
  const existingCols: string[] = [];
  const missingCols: string[] = [];

  for (const col of CANDIDATE_COLUMNS) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=${col}&limit=1`, {
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
