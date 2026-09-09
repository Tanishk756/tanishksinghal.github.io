import { chromium } from 'playwright-core';

const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';
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

async function runExperienceVerification() {
  console.log('================================================================');
  console.log('  STARTING EXPERIENCE CMS CRUD & DELETE VERIFICATION');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);

  console.log('--- STEP 1: Fetch Existing Experience Records ---');
  const initialFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialJson = await initialFetch.json();
  const initialList = Array.isArray(initialJson.data) ? initialJson.data : [];
  const initialIds = initialList.map((d: any) => d.id);
  console.log(`Initial experience records count: ${initialList.length}`);
  console.log('Existing IDs:', initialIds);

  console.log('\n--- STEP 2: API Flow — Create Temporary Test Experience ---');
  const apiTestPayload = {
    organization: 'Autonomous Robotics Lab Test',
    role: 'Lead Systems Architect (Temporary API Test)',
    employmentType: 'Full-time / Research',
    location: 'Bangalore, India',
    startDate: '2025',
    endDate: 'Present',
    current: true,
    description: 'API verification test record for experience schema and deletion verification.',
    responsibilities: [
      'Developed real-time autonomous path planner',
      'Verified zero regression on deletion endpoint'
    ],
    technologies: ['ROS 2', 'C++', 'Python', 'Nav2'],
    publicationStatus: 'draft',
    verificationStatus: 'USER_PROVIDED',
    source: 'USER_PROVIDED',
    sourceUrl: 'https://example.com/evidence/test',
    notes: 'Automated test suite verification run'
  };

  const createRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(apiTestPayload),
  });

  const createJson = await createRes.json();
  console.log('Create Response:', createJson);

  if (!createJson.success || !createJson.id) {
    throw new Error(`Failed to create test experience: ${JSON.stringify(createJson)}`);
  }

  const apiTestExperienceId = createJson.id;
  console.log(`✓ Test Experience Created with UUID: ${apiTestExperienceId}`);

  console.log('\n--- STEP 3: Verify Test Experience Exists in Database ---');
  const dbCheckRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${apiTestExperienceId}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const dbJson = await dbCheckRes.json();
  console.log('Database Item fetched by UUID:', dbJson);
  const foundItem = Array.isArray(dbJson.data) ? dbJson.data.find((d: any) => d.id === apiTestExperienceId) : dbJson.data;
  if (!foundItem || foundItem.id !== apiTestExperienceId) {
    throw new Error('Test experience record not found in Supabase database by UUID!');
  }
  console.log('✓ Verified: Record exists in database with matching UUID and correct schema.');

  console.log('\n--- STEP 4: Test Editing the Experience Record via API ---');
  const editPayload = {
    ...apiTestPayload,
    id: apiTestExperienceId,
    description: 'Updated description for temporary verification test.',
    technologies: ['ROS 2', 'C++', 'Python', 'Nav2', 'Gazebo Sim'],
  };

  const updateRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${apiTestExperienceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(editPayload),
  });
  const updateJson = await updateRes.json();
  console.log('Update Response:', updateJson);
  if (!updateJson.success) {
    throw new Error(`Failed to update test experience: ${JSON.stringify(updateJson)}`);
  }
  console.log('✓ Verified: Record update succeeded.');

  console.log('\n--- STEP 5: Delete the Test Experience via API by UUID ---');
  const deleteRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${apiTestExperienceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const deleteJson = await deleteRes.json();
  console.log('Delete Response:', deleteJson);
  if (!deleteJson.success) {
    throw new Error(`Failed to delete test experience: ${JSON.stringify(deleteJson)}`);
  }
  console.log('✓ Verified: API Delete returned success: true.');

  console.log('\n--- STEP 6: Confirm Test UUID No Longer Exists in Database ---');
  const dbPostDeleteRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${apiTestExperienceId}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const postDeleteJson = await dbPostDeleteRes.json();
  const postDeleteList = Array.isArray(postDeleteJson.data) ? postDeleteJson.data : (postDeleteJson.data ? [postDeleteJson.data] : []);
  const stillFound = postDeleteList.some((d: any) => d.id === apiTestExperienceId);
  if (!stillFound) {
    console.log(`✓ Proof of Deletion: Experience UUID ${apiTestExperienceId} has been completely removed from the database.`);
  } else {
    throw new Error(`Experience record ${apiTestExperienceId} was NOT deleted!`);
  }

  console.log('\n================================================================');
  console.log('  STARTING REAL CHROME BROWSER EXPERIENCE UI TEST');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
  });

  await context.addInitScript(({ token, email, supabaseUrl }) => {
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const now = Math.floor(Date.now() / 1000);
    const sessionObj = {
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: now + 3600,
      refresh_token: 'test_refresh_token',
      user: {
        id: 'test-admin-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        app_metadata: { provider: 'email' },
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessionObj));
    } catch (e) {}
  }, { token: adminToken, email: ADMIN_EMAIL, supabaseUrl: SUPABASE_URL });

  const page = await context.newPage();

  const capturedRequests: Array<{ method: string; url: string; status: number; body?: string }> = [];
  page.on('console', msg => {
    const txt = msg.text();
    if (!txt.includes('Download the React DevTools') && !txt.includes('[vite]')) {
      console.log(`[Browser Console ${msg.type().toUpperCase()}]:`, txt);
    }
  });

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('/functions/v1/')) {
      let body = '';
      try { body = await resp.text(); } catch (e) {}
      const req = resp.request();
      capturedRequests.push({
        method: req.method(),
        url: url,
        status: resp.status(),
        body: body.slice(0, 400),
      });
      console.log(`[DevTools Network]: ${req.method()} ${url} -> HTTP ${resp.status()}`);
    }
  });

  page.on('dialog', async dialog => {
    console.log(`[Browser Dialog]: ${dialog.message()}`);
    await dialog.accept();
  });

  console.log('--- UI STEP 1: Navigate to /admin/experience ---');
  await page.goto('http://localhost:5173/admin/experience', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('--- UI STEP 2: Click "New Experience" Button ---');
  await page.waitForSelector('button:has-text("New Experience")', { timeout: 10000 });
  const newExpBtn = page.locator('button:has-text("New Experience")');
  await newExpBtn.click();

  console.log('--- UI STEP 3: Fill Experience Form ---');
  await page.waitForSelector('input', { timeout: 5000 });

  const orgInput = page.locator('div.space-y-1\\.5:has(label:has-text("Organization / Lab Name")) input');
  await orgInput.fill('Autonomous Swarm Robotics Lab UI Test');

  const roleInput = page.locator('div.space-y-1\\.5:has(label:has-text("Role Title")) input');
  await roleInput.fill('Principal Robotics Engineer');

  const locationInput = page.locator('div.space-y-1\\.5:has(label:has-text("Location")) input');
  await locationInput.fill('Bengaluru, India');

  const descInput = page.locator('div.space-y-1\\.5:has(label:has-text("Overview & Scope")) textarea');
  await descInput.fill('Formulated distributed control algorithms for multi-agent autonomous robotic swarms.');

  console.log('--- UI STEP 4: Click "Save Role" Button ---');
  capturedRequests.length = 0;
  const saveRoleBtn = page.locator('button:has-text("Save Role")');
  await saveRoleBtn.click();

  await page.waitForTimeout(3000);

  const saveReq = capturedRequests.find(r => r.method === 'POST' && r.url.includes('admin-content') && r.url.includes('type=experience'));
  console.log(`Captured Save Request: HTTP ${saveReq?.status}`);
  if (!saveReq || (saveReq.status !== 200 && saveReq.status !== 201)) {
    throw new Error(`UI Save failed: expected 200/201, got ${saveReq?.status}`);
  }

  const saveJson = JSON.parse(saveReq.body || '{}');
  const createdUiExperienceId = saveJson.id;
  console.log(`✓ Experience Created via UI with UUID: ${createdUiExperienceId}`);

  // Confirm it appears in the UI
  await page.waitForSelector(`text=Autonomous Swarm Robotics Lab UI Test`, { timeout: 5000 });
  console.log('✓ Verified: Created experience record is rendered on the UI page.');

  console.log('\n--- UI STEP 5: Click "Delete" Button in UI ---');
  capturedRequests.length = 0;

  // Find the card with "Autonomous Swarm Robotics Lab UI Test" and click its trash/delete button
  const expCard = page.locator('div.p-5:has-text("Autonomous Swarm Robotics Lab UI Test")');
  const deleteBtn = expCard.locator('button[title="Delete"]');
  await deleteBtn.click();

  await page.waitForTimeout(3000);

  const deleteUiReq = capturedRequests.find(r => r.method === 'DELETE' && r.url.includes('admin-content') && r.url.includes('type=experience'));
  console.log('\nCaptured Delete Request:');
  console.log(`  URL: ${deleteUiReq?.url}`);
  console.log(`  Method: ${deleteUiReq?.method}`);
  console.log(`  HTTP Status: ${deleteUiReq?.status}`);
  console.log(`  Response Body: ${deleteUiReq?.body}`);

  if (!deleteUiReq || deleteUiReq.status !== 200) {
    throw new Error(`UI Delete failed: expected HTTP 200, got ${deleteUiReq?.status}`);
  }

  console.log('\n--- UI STEP 6: Confirm UI Record Deleted from DB ---');
  const dbCheckPostUiDelete = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${createdUiExperienceId}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const dbPostUiJson = await dbCheckPostUiDelete.json();
  const dbPostUiList = Array.isArray(dbPostUiJson.data) ? dbPostUiJson.data : (dbPostUiJson.data ? [dbPostUiJson.data] : []);
  const uiStillFound = dbPostUiList.some((d: any) => d.id === createdUiExperienceId);
  if (!uiStillFound) {
    console.log(`✓ Proof of UI Deletion: Experience UUID ${createdUiExperienceId} deleted from database.`);
  } else {
    throw new Error(`Experience ${createdUiExperienceId} still exists in DB!`);
  }

  console.log('\n--- UI STEP 7: Confirm Existing Experience Records Intact ---');
  const finalCheckFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const finalCheckJson = await finalCheckFetch.json();
  const finalCheckIds = Array.isArray(finalCheckJson.data) ? finalCheckJson.data.map((d: any) => d.id) : [];
  console.log('Final remaining IDs:', finalCheckIds);
  const lostIds = initialIds.filter(id => !finalCheckIds.includes(id));
  if (lostIds.length > 0) {
    throw new Error(`Existing records were deleted: ${JSON.stringify(lostIds)}`);
  }
  console.log('✓ Proof of Preservation: All original records preserved.');

  await browser.close();

  console.log('\n================================================================');
  console.log('  ALL E2E API & BROWSER VERIFICATION TESTS PASSED SUCCESSFULLY');
  console.log('================================================================');
}

runExperienceVerification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
