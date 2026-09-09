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

async function probeFilingDate() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);

  // Test empty string filingDate
  const resEmpty = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Probe Filing Date Empty',
      slug: 'probe-fd-empty-' + Date.now(),
      inventors: ['Tanishk Singhal'],
      applicationNumber: '202511107435',
      jurisdiction: 'India',
      status: 'granted',
      abstract: 'Testing empty filing date without inventing today date.',
      filingDate: '',
      publicationStatus: 'draft'
    })
  });

  const dataEmpty = await resEmpty.json();
  console.log('Empty filing date response:', resEmpty.status, dataEmpty);

  if (dataEmpty.success && dataEmpty.id) {
    await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent&id=${dataEmpty.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
  }
}

probeFilingDate();
