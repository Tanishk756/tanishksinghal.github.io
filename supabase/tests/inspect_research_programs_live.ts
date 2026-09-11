import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function inspectLiveResearchPrograms() {
  console.log('=== INSPECTING LIVE research_programs TABLE ===');
  
  // Query Supabase REST for research_programs
  const res = await fetch(`${SUPABASE_URL}/rest/v1/research_programs?select=*`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
  
  console.log('REST response status:', res.status);
  const data = await res.json();
  console.log('Existing records count:', Array.isArray(data) ? data.length : data);
  if (Array.isArray(data) && data.length > 0) {
    console.log('Sample record keys:', Object.keys(data[0]));
    console.log('Records:', JSON.stringify(data, null, 2));
  }
}

inspectLiveResearchPrograms().catch(console.error);
