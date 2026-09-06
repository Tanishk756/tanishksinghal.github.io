import https from 'https';

async function fetchLiveIndex(): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'tanishk756.github.io',
      path: '/tanishksinghal.github.io/',
      headers: { 'User-Agent': 'Tanishk-Live-Auth-Audit' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchAsset(assetPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    const options = {
      hostname: 'tanishk756.github.io',
      path: cleanPath,
      headers: { 'User-Agent': 'Tanishk-Live-Auth-Audit' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testSupabaseAuthApi() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'tanishksinghal6285@gmail.com',
      password: 'invalid-test-password-for-audit'
    });

    const options = {
      hostname: 'fpjaijgbcdalrdgwbece.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S',
        'Authorization': 'Bearer sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S',
        'User-Agent': 'Tanishk-Auth-Client'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== LIVE PRODUCTION DEPLOYMENT & AUTH AUDIT ===\n');

  // 1. Fetch live index HTML
  const indexHtml = await fetchLiveIndex();
  console.log('1. Live index.html loaded: length =', indexHtml.length);

  // Extract JS bundle paths
  const jsMatches = [...indexHtml.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
  console.log('2. Main JS entrypoints in HTML:', jsMatches);

  if (jsMatches.length > 0) {
    const mainJs = await fetchAsset(jsMatches[0]);
    console.log('3. Fetched main JS bundle: length =', mainJs.length);
    const hasSupabaseUrl = mainJs.includes('fpjaijgbcdalrdgwbece.supabase.co');
    const hasPublishableKey = mainJs.includes('sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S');
    const hasPlaceholder = mainJs.includes('sb_placeholder_anon_key');

    console.log('   - Contains valid Supabase URL:', hasSupabaseUrl);
    console.log('   - Contains valid Publishable Key:', hasPublishableKey);
    console.log('   - Contains stale placeholder key:', hasPlaceholder);
  }

  // 4. Test live Supabase Auth endpoint with this key
  const authRes: any = await testSupabaseAuthApi();
  console.log('\n4. Live Supabase Auth Response with Publishable Key:');
  console.log('   - Status Code:', authRes.statusCode);
  console.log('   - Response Body:', authRes.body);

  const parsed = JSON.parse(authRes.body);
  const isValidApiKey = !authRes.body.includes('Invalid API key') && !authRes.body.includes('invalid apikey');
  console.log('\n=== RESULT ===');
  console.log('API Key Validated by Supabase Auth Backend:', isValidApiKey ? 'YES (PASS)' : 'NO (FAIL)');
  console.log('Auth Error is authentic user credential rejection (not API key rejection):', parsed.error_description === 'Invalid login credentials' || parsed.msg === 'Invalid login credentials');
}

run().catch(console.error);
