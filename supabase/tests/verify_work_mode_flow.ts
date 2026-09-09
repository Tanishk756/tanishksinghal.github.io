import { normalizeExperience } from '../../src/cms/publicContentClient';

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

async function runVerification() {
  console.log('=== VERIFYING WORK MODE FLOW ===');
  const token = createAdminJwt(ADMIN_EMAIL);

  // 1. Fetch current experience records
  const listRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listJson = await listRes.json();
  if (!listJson.success || !Array.isArray(listJson.data)) {
    throw new Error('Failed to fetch experiences: ' + JSON.stringify(listJson));
  }

  const droniq = listJson.data.find((e: any) => e.organization?.includes('DronIQ'));
  if (!droniq) {
    throw new Error('DronIQ record not found in database!');
  }
  console.log(`Found DronIQ record ID: ${droniq.id}, Location: "${droniq.location}", Work Mode: "${droniq.workMode || droniq.work_mode}"`);

  // 2. Test updating to on_site
  console.log('\n--- 2. Updating DronIQ workMode to "on_site" ---');
  const onSitePayload = {
    ...droniq,
    location: 'Jammu, India',
    workMode: 'on_site',
    publicationStatus: 'approved',
  };
  const patchRes1 = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${droniq.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(onSitePayload)
  });
  const patchJson1 = await patchRes1.json();
  console.log('Patch on_site result:', patchJson1);

  // Publish
  const pubRes1 = await fetch(`${SUPABASE_URL}/functions/v1/admin-publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      contentType: 'experience',
      contentId: droniq.id,
      currentStatus: 'approved',
      verificationStatus: 'USER_PROVIDED'
    })
  });
  console.log('Publish on_site result:', await pubRes1.json());

  // Direct DB check for on_site
  const dbCheck1 = await fetch(`${SUPABASE_URL}/rest/v1/experience?id=eq.${droniq.id}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  });
  const dbRow1 = (await dbCheck1.json())[0];
  console.log(`DB Row 1: location="${dbRow1.location}", work_mode="${dbRow1.work_mode}", employment_type="${dbRow1.employment_type}", publication_status="${dbRow1.publication_status}"`);
  if (dbRow1.work_mode !== 'on_site' || dbRow1.location !== 'Jammu, India') {
    throw new Error('Failed: DB row did not persist on_site work_mode or lost location!');
  }
  const norm1 = normalizeExperience(dbRow1);
  const display1 = norm1.location ? `${norm1.location}${norm1.workMode ? ` · ${norm1.workMode}` : ''}`.toUpperCase() : '';
  console.log(`Public Render 1: "${display1}"`);
  if (display1 !== 'JAMMU, INDIA · ON-SITE') {
    throw new Error(`Expected "JAMMU, INDIA · ON-SITE" but got "${display1}"`);
  }

  // 3. Test updating to hybrid
  console.log('\n--- 3. Updating DronIQ workMode to "hybrid" ---');
  const hybridPayload = {
    ...droniq,
    location: 'Jammu, India',
    workMode: 'hybrid',
    publicationStatus: 'approved',
  };
  const patchRes2 = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${droniq.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(hybridPayload)
  });
  const patchJson2 = await patchRes2.json();
  console.log('Patch hybrid result:', patchJson2);

  const pubRes2 = await fetch(`${SUPABASE_URL}/functions/v1/admin-publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      contentType: 'experience',
      contentId: droniq.id,
      currentStatus: 'approved',
      verificationStatus: 'USER_PROVIDED'
    })
  });
  console.log('Publish hybrid result:', await pubRes2.json());

  const dbCheck2 = await fetch(`${SUPABASE_URL}/rest/v1/experience?id=eq.${droniq.id}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  });
  const dbRow2 = (await dbCheck2.json())[0];
  console.log(`DB Row 2: location="${dbRow2.location}", work_mode="${dbRow2.work_mode}"`);
  if (dbRow2.work_mode !== 'hybrid') {
    throw new Error('Failed: DB row did not persist hybrid work_mode!');
  }
  const norm2 = normalizeExperience(dbRow2);
  const display2 = norm2.location ? `${norm2.location}${norm2.workMode ? ` · ${norm2.workMode}` : ''}`.toUpperCase() : '';
  console.log(`Public Render 2: "${display2}"`);
  if (display2 !== 'JAMMU, INDIA · HYBRID') {
    throw new Error(`Expected "JAMMU, INDIA · HYBRID" but got "${display2}"`);
  }

  // 4. Test updating to remote
  console.log('\n--- 4. Updating DronIQ workMode to "remote" ---');
  const remotePayload = {
    ...droniq,
    location: 'Jammu, India',
    workMode: 'remote',
    publicationStatus: 'approved',
  };
  const patchRes3 = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${droniq.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(remotePayload)
  });
  const patchJson3 = await patchRes3.json();
  console.log('Patch remote result:', patchJson3);

  const pubRes3 = await fetch(`${SUPABASE_URL}/functions/v1/admin-publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      contentType: 'experience',
      contentId: droniq.id,
      currentStatus: 'approved',
      verificationStatus: 'USER_PROVIDED'
    })
  });
  console.log('Publish remote result:', await pubRes3.json());

  const dbCheck3 = await fetch(`${SUPABASE_URL}/rest/v1/experience?id=eq.${droniq.id}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  });
  const dbRow3 = (await dbCheck3.json())[0];
  console.log(`DB Row 3: location="${dbRow3.location}", work_mode="${dbRow3.work_mode}"`);
  if (dbRow3.work_mode !== 'remote') {
    throw new Error('Failed: DB row did not persist remote work_mode!');
  }
  const norm3 = normalizeExperience(dbRow3);
  const display3 = norm3.location ? `${norm3.location}${norm3.workMode ? ` · ${norm3.workMode}` : ''}`.toUpperCase() : '';
  console.log(`Public Render 3: "${display3}"`);
  if (display3 !== 'JAMMU, INDIA · REMOTE') {
    throw new Error(`Expected "JAMMU, INDIA · REMOTE" but got "${display3}"`);
  }

  // 5. Test missing/null work_mode
  console.log('\n--- 5. Testing missing/null work_mode behavior ---');
  const nullWorkModeItem = {
    organization: 'Test Lab',
    role_title: 'Engineer',
    location: 'Jammu, India',
    work_mode: null,
  };
  const normNull = normalizeExperience(nullWorkModeItem);
  const displayNull = normNull.location ? `${normNull.location}${normNull.workMode ? ` · ${normNull.workMode}` : ''}`.toUpperCase() : '';
  console.log(`Public Render with null work_mode: "${displayNull}"`);
  if (displayNull !== 'JAMMU, INDIA') {
    throw new Error(`Expected "JAMMU, INDIA" for null work_mode but got "${displayNull}"`);
  }

  // 6. Set final DronIQ record to on_site with publication_status: published
  console.log('\n--- 6. Setting DronIQ record to on_site as final canonical state ---');
  await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${droniq.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...droniq,
      location: 'Jammu, India',
      workMode: 'on_site',
      publicationStatus: 'approved',
    })
  });
  await fetch(`${SUPABASE_URL}/functions/v1/admin-publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      contentType: 'experience',
      contentId: droniq.id,
      currentStatus: 'approved',
      verificationStatus: 'USER_PROVIDED'
    })
  });

  const finalCheck = await fetch(`${SUPABASE_URL}/rest/v1/experience?id=eq.${droniq.id}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  });
  const finalRow = (await finalCheck.json())[0];
  console.log('Final DB state for DronIQ:', {
    id: finalRow.id,
    organization: finalRow.organization,
    role: finalRow.role_title,
    location: finalRow.location,
    work_mode: finalRow.work_mode,
    employment_type: finalRow.employment_type,
    publication_status: finalRow.publication_status,
  });

  console.log('\n✅ ALL WORK MODE VERIFICATION CHECKS PASSED!');
}

runVerification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
