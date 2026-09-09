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

async function testPostPatent() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);
  
  // Test POST to admin-content with various status values and fields
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Probe Patent',
      slug: 'probe-patent-' + Date.now(),
      inventors: ['Tanishk Singhal'],
      applicationNumber: '202511107435',
      patentNumber: '202511107435',
      filingDate: '2025-01-01',
      jurisdiction: 'India',
      status: 'granted',
      abstract: 'Testing abstract mapping.',
      publicationStatus: 'draft'
    })
  });

  console.log('POST status:', res.status);
  const data = await res.json();
  console.log('POST response:', data);
}

testPostPatent();
