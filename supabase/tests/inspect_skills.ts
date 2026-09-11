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
  return `${b64(header)}.${b64(payload)}.browser_test_sig`;
}

async function inspectSkills() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const json = await res.json();
  const list = json.data || [];
  console.log(`Total skills returned by admin-content: ${list.length}`);
  const catCount: Record<string, number> = {};
  list.forEach((item: any, i: number) => {
    catCount[item.category] = (catCount[item.category] || 0) + 1;
    console.log(`${i + 1}. [${item.category}] ${item.name} (status: ${item.publication_status}, sub: ${item.subdiscipline || item.description})`);
  });
  console.log('\nCategory breakdown:', catCount);
}

inspectSkills();
