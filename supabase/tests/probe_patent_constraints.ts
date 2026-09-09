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

async function probePatentsViaAdminContent() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);

  const getRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('GET /admin-content?type=patent status:', getRes.status);
  const getData = await getRes.json();
  console.log('Existing patent records:', getData);
}

probePatentsViaAdminContent();
