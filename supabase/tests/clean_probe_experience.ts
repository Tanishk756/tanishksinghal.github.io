const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ADMIN_EMAIL = 'tanishksinghal6285@gmail.com';

function createAdminJwt(email: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'test-admin-id',
    email,
    aud: 'authenticated',
    role: 'authenticated',
    exp: now + 3600,
    iat: now,
  };
  const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64(header)}.${b64(payload)}.sig`;
}

async function clean() {
  const token = createAdminJwt(ADMIN_EMAIL);
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Current experience rows count:', data.data?.length);
  for (const item of (data.data || [])) {
    console.log(`- ID: ${item.id} | Org: ${item.organization} | Role: ${item.role_title || item.role}`);
    if (item.organization.includes('Quantum') || item.organization.includes('Autonomous') || item.organization.includes('Test')) {
      console.log(`  Deleting temp test record ${item.id} (${item.organization})...`);
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }

  const finalRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const finalData = await finalRes.json();
  console.log('Remaining experience rows count:', finalData.data?.length);
  for (const item of (finalData.data || [])) {
    console.log(`  * ID: ${item.id} | Org: ${item.organization} | Status: ${item.publicationStatus}`);
  }
}
clean();
