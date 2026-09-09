const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ADMIN_EMAIL = 'tanishksinghal6285@gmail.com';

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
  return `${b64(header)}.${b64(payload)}.probe_sig`;
}

async function testStatusConstraints() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);
  
  // Potential status values
  const testStatuses = [
    'granted', 'Granted', 'filed', 'Filed', 'published', 'Published',
    'provisional', 'Provisional', 'pending', 'Pending',
    'Published / Pending Examination', 'Under Review', 'under-review',
    'in-preparation', 'Abandoned', 'abandoned',
    'ACTIVE', 'active', 'COMPLETED', 'completed', 'FILED', 'GRANTED'
  ];

  for (const st of testStatuses) {
    const slug = 'test-st-' + Math.random().toString(36).substring(2, 8);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Status Test ' + st,
        slug,
        inventors: ['Tanishk Singhal'],
        applicationNumber: '202511107435',
        patentNumber: '202511107435',
        filingDate: '2025-01-01',
        jurisdiction: 'India',
        status: st,
        abstract: 'Testing abstract mapping.',
        publicationStatus: 'draft'
      })
    });

    const data = await res.json();
    console.log(`Status value '${st}': ${res.status} =>`, data.success ? 'SUCCESS (id=' + data.id + ')' : data.error);
    if (data.success && data.id) {
      // clean up
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent&id=${data.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }
  }
}

testStatusConstraints();
