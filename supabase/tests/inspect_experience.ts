const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function testExperienceSchemaColumns() {
  const candidateCols = [
    'id', 'slug', 'title', 'company', 'organization', 'role', 'role_title',
    'location', 'start_date', 'end_date', 'is_current', 'employment_type',
    'work_mode', 'description', 'responsibilities', 'technologies', 'skills',
    'evidence_url', 'company_url', 'display_order', 'publication_status',
    'verification_status', 'verification_notes', 'last_verified', 'created_at', 'updated_at'
  ];

  const results: Record<string, boolean> = {};
  for (const c of candidateCols) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/experience?select=${c}&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    results[c] = res.ok;
  }
  console.log('Experience Column existence in live DB:', results);
}
testExperienceSchemaColumns();
