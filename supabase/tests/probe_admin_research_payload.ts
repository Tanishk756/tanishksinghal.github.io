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

async function probeAdminPayload() {
  const adminToken = createAdminJwt('tanishksinghal6285@gmail.com');
  console.log('=== PROBING research_programs WITH ADMIN UI PAYLOAD ===');

  const adminUiPayload = {
    title: 'PROBE_TEST_RESEARCH_TITLE',
    slug: 'probe-test-research-slug-' + Date.now(),
    domain: 'Robotics & Autonomous Systems',
    summary: 'This is a test research summary with sufficient length.',
    problem: 'How do closed-loop systems handle singularities?',
    methodology: 'Empirical simulation in ROS 2 Gazebo environment.',
    status: 'active',
    publicationStatus: 'draft',
    verificationStatus: 'USER_PROVIDED',
    source: 'USER_PROVIDED',
    sourceUrl: '',
    lastVerified: '2026-09-09',
    notes: '',
  };

  console.log('\nTesting admin-content POST with adminUiPayload:');
  const restRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(adminUiPayload),
  });
  const restJson = await restRes.json();
  console.log('admin-content POST response:', restJson);
}

probeAdminPayload().catch(console.error);
