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

async function cleanAllPublications() {
  const token = createAdminJwt('tanishksinghal6285@gmail.com');
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  console.log(`Currently found ${json.data?.length} publications in DB:`);
  for (const item of (json.data || [])) {
    console.log(`Deleting: id=${item.id}, title="${item.title}"`);
    await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication&id=${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  console.log('Clean up finished.');
}

cleanAllPublications();
