const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

function createAdminJwt(email: string, expiresInSec = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'test-admin-id',
    email,
    aud: 'authenticated',
    role: 'authenticated',
    exp: now + expiresInSec,
    iat: now,
  };
  const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64(header)}.${b64(payload)}.test_sig`;
}

async function testPubTypes() {
  const token = createAdminJwt('tanishksinghal6285@gmail.com');
  const testTypes = [
    'journal',
    'conference',
    'preprint',
    'workshop',
    'Peer-Reviewed Conference',
    'Journal Article',
    'Workshop Paper',
    'Preprint',
    'Technical Report'
  ];

  console.log('=== TESTING PUBLICATION_TYPE VALUES ===');

  for (const t of testTypes) {
    const payload = {
      title: `Test Publication ${t}`,
      slug: `test-pub-${t.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      venue: 'IEEE Conference on Robotics and Automation',
      publication_type: t,
      year: 2026,
      abstract: 'This is a valid abstract for testing robotics autonomy and kinematics verification.',
      authors: ['Tanishk Singhal'],
      keywords: ['Robotics', 'Autonomy'],
      publication_status: 'draft',
      verification_status: 'USER_PROVIDED',
      last_verified: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/publications`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (res.ok) {
      console.log(`✅ publication_type: "${t}" -> SUCCEEDED (id: ${body[0]?.id})`);
      // Delete immediately to keep clean
      if (body[0]?.id) {
        await fetch(`${SUPABASE_URL}/rest/v1/publications?id=eq.${body[0].id}`, {
          method: 'DELETE',
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` }
        });
      }
    } else {
      console.log(`❌ publication_type: "${t}" -> FAILED: ${body.message}`);
    }
  }
}

testPubTypes();
