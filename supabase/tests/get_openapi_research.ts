const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function getOpenApiSchema() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
  const spec = await res.json();
  console.log('=== OpenAPI Definition for research_programs ===');
  const def = spec.definitions?.research_programs;
  if (def) {
    console.log('Properties of research_programs:');
    for (const [col, details] of Object.entries(def.properties || {})) {
      console.log(`  - ${col}: type=${(details as any).type}, format=${(details as any).format}, description=${(details as any).description || ''}`);
    }
    console.log('Required fields:', def.required);
  } else {
    console.log('research_programs definition not found in definitions. Keys:', Object.keys(spec.definitions || {}));
  }
}

getOpenApiSchema().catch(console.error);
