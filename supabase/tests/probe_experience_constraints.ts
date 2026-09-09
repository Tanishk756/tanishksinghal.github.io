const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';
const ADMIN_EMAIL = 'tanishksinghal6285@gmail.com';

function createAdminJwt(email: string): string {
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

async function probeEmploymentTypes() {
  const token = createAdminJwt(ADMIN_EMAIL);
  const types = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Research', 'Founder', 'Full-time / Research'];
  for (const et of types) {
    const testPayload = {
      organization: 'Probe Org',
      role_title: 'Probe Role',
      location: 'Test Location',
      start_date: '2025',
      work_mode: 'remote',
      employment_type: et,
      description: 'Probe test',
      responsibilities: [],
      technologies: [],
      publication_status: 'draft',
      verification_status: 'USER_PROVIDED'
    };
    const testRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(testPayload)
    });
    const testJson = await testRes.json();
    console.log(`employment_type="${et}" -> success=${testJson.success} ${testJson.error || testJson.id}`);
    if (testJson.success && testJson.id) {
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${testJson.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }
}
probeEmploymentTypes();
