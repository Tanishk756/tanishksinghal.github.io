const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';

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
  const candidateTypes = [
    'Peer-Reviewed Conference',
    'Journal Article',
    'Workshop Paper',
    'Preprint',
    'Technical Report',
    'Patent Filing',
    'conference',
    'journal',
    'preprint',
    'workshop',
    'book-chapter'
  ];

  for (const t of candidateTypes) {
    const payload = {
      title: `Test Publication ${t}`,
      slug: `test-type-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      venue: 'IEEE Conference',
      publicationType: t,
      year: 2026,
      abstract: 'Valid abstract for testing publication type check constraint in Supabase database.',
      authors: ['Tanishk Singhal'],
      keywords: ['Robotics'],
      publicationStatus: 'draft',
      verificationStatus: 'USER_PROVIDED',
    };

    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (res.status === 201 || res.status === 200) {
      console.log(`✅ publicationType: "${t}" -> SUCCESS (id: ${body.id})`);
      // Delete test item
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication&id=${body.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      console.log(`❌ publicationType: "${t}" -> FAILED (status ${res.status}): ${body.error}`);
    }
  }
}

testPubTypes();
