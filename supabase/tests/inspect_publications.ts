const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function testSchemaColumns() {
  const cols = [
    'id', 'slug', 'title', 'authors', 'venue', 'publication_type',
    'year', 'date', 'doi', 'abstract', 'keywords', 'pdf_url',
    'doi_url', 'scholar_url', 'researchgate_url', 'citation_count',
    'display_order', 'publication_status', 'verification_status',
    'verification_notes', 'last_verified', 'created_at', 'updated_at'
  ];

  const results: Record<string, boolean> = {};
  for (const c of cols) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/publications?select=${c}&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    results[c] = res.ok;
  }
  console.log('Column existence in live DB:', results);
}
testSchemaColumns();
