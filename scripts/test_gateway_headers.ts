async function test() {
  const url = 'https://fpjaijgbcdalrdgwbece.supabase.co/functions/v1/admin-content?action=stats';
  const apikey = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

  console.log('1. Fetching without apikey header...');
  try {
    const res1 = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    const text1 = await res1.text();
    console.log(`Without apikey -> HTTP ${res1.status}: ${text1}`);
  } catch (e: any) {
    console.error('Error 1:', e.message);
  }

  console.log('\n2. Fetching with apikey header...');
  try {
    const res2 = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`
      }
    });
    const text2 = await res2.text();
    console.log(`With apikey -> HTTP ${res2.status}: ${text2}`);
  } catch (e: any) {
    console.error('Error 2:', e.message);
  }
}

test();
