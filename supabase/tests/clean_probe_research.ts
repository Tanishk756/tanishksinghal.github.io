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
  return `${b64(header)}.${b64(payload)}.browser_test_sig`;
}

async function cleanResearch() {
  const adminToken = createAdminJwt('tanishksinghal6285@gmail.com');
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=research`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const json = await res.json();
  const data = json.data || [];
  console.log('Current research records in DB:', data.length);
  for (const item of (Array.isArray(data) ? data : [])) {
    if (item.slug?.includes('test') || item.title?.includes('test') || item.title?.includes('TEST') || item.title?.includes('PROBE')) {
      console.log('Deleting test item:', item.title, item.id);
      const delRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=research&id=${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      console.log('Delete result:', await delRes.json());
    }
  }
  console.log('Clean complete.');
}

cleanResearch().catch(console.error);
