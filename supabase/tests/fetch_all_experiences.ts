const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

async function fetchAll() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/experience?select=*`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
fetchAll();
