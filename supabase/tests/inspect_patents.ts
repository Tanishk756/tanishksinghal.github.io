const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function testPatentSchemaColumns() {
  const cols = [
    'id', 'slug', 'title', 'inventors', 'application_number', 'patent_number',
    'jurisdiction', 'filing_date', 'publication_date', 'status', 'assignee',
    'description', 'abstract', 'registry_url', 'patent_url', 'evidence_url',
    'display_order', 'publication_status', 'verification_status', 'verification_notes',
    'last_verified', 'created_at', 'updated_at', 'pdf_url', 'notes', 'claims'
  ];

  const results: Record<string, boolean> = {};
  for (const c of cols) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/patents?select=${c}&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    results[c] = res.ok;
  }
  console.log('Patent Column existence in live DB:', results);
}
testPatentSchemaColumns();
