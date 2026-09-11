const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

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

async function probeConstraints() {
  const adminToken = createAdminJwt('tanishksinghal6285@gmail.com');
  console.log('=== PROBING research_programs CONSTRAINTS & INSERT CAPABILITIES ===');

  // Test inserting with raw Supabase REST vs admin-content
  const testPayload = {
    title: 'PROBE_TEST_RESEARCH_TITLE',
    slug: 'probe-test-research-slug-' + Date.now(),
    research_area: 'Robotics & Control Systems',
    summary: 'This is a test research summary with sufficient length.',
    research_question: 'How do closed-loop systems handle singularities?',
    methodology: 'Empirical simulation in ROS 2 Gazebo environment.',
    key_contribution: 'Singularity boundary normalizer algorithm.',
    status: 'active',
    publication_status: 'draft',
    verification_status: 'USER_PROVIDED',
    display_order: 0,
  };

  console.log('\n1. Testing direct REST insert with existing schema fields:');
  const restRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(testPayload),
  });
  const restJson = await restRes.json();
  console.log('admin-content POST response:', restJson);

  if (restJson.id) {
    console.log('Deleting probe record:', restJson.id);
    await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=research&id=${restJson.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }
}

probeConstraints().catch(console.error);
