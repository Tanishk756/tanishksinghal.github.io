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

async function runExperienceDraftPublishFlow() {
  console.log('================================================================');
  console.log('  STARTING EXPERIENCE CMS DRAFT -> PUBLISH REAL BROWSER TEST');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);

  // Step 0: Check initial database state
  console.log('--- STEP 0: Check Initial Experience Database Records ---');
  const initialFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialJson = await initialFetch.json();
  const initialList = Array.isArray(initialJson.data) ? initialJson.data : [];
  const initialIds = initialList.map((d: any) => d.id);
  console.log(`Initial experience count: ${initialList.length}`);
  console.log('Initial IDs in DB:', initialIds);

  // Launch Playwright Chrome
  console.log('\n--- STEP 1: Launch Chrome & Authenticate Admin Session ---');
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

  console.log('\n--- STEP 2: Navigate to /admin/experience ---');
  await page.goto('http://localhost:5173/admin/experience', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  // Step 3: Open create form
  console.log('\n--- STEP 3: Click "New Experience" Button ---');
  await page.waitForSelector('button:has-text("New Experience")', { timeout: 10000 });
  await page.locator('button:has-text("New Experience")').click();

  // Step 4: Fill form
  console.log('\n--- STEP 4: Fill Experience Form Details ---');
  await page.waitForSelector('input', { timeout: 5000 });

  await page.locator('div.space-y-1\\.5:has(label:has-text("Organization / Lab Name")) input').fill('Quantum AI Robotics Institute');
  await page.locator('div.space-y-1\\.5:has(label:has-text("Role Title")) input').fill('Chief Robotics Architect');
  await page.locator('div.space-y-1\\.5:has(label:has-text("Location")) input').fill('Bengaluru, India');
  await page.locator('div.space-y-1\\.5:has(label:has-text("Start Date")) input').fill('2025');
  await page.locator('div.space-y-1\\.5:has(label:has-text("Overview & Scope")) textarea').fill('Leading development of quantum-accelerated perception and control pipelines for multi-agent autonomous swarms.');

  // Step 5: Click "Save Draft"
  console.log('\n--- STEP 5: Click "Save Draft" Button in UI ---');
  capturedRequests.length = 0;
  await page.locator('button:has-text("Save Draft")').click();
  await page.waitForTimeout(3000);

  const saveDraftReq = capturedRequests.find(r => r.method === 'POST' && r.url.includes('admin-content') && r.url.includes('type=experience'));
  console.log(`Save Draft Request Status: HTTP ${saveDraftReq?.status}`);
  if (!saveDraftReq || (saveDraftReq.status !== 200 && saveDraftReq.status !== 201)) {
    throw new Error(`Save Draft failed with status ${saveDraftReq?.status}`);
  }

  const draftJson = JSON.parse(saveDraftReq.body || '{}');
  const testExperienceId = draftJson.id;
  console.log(`✓ Test Experience created as Draft with UUID: ${testExperienceId}`);

  // Step 6: Verify DB publication_status is draft
  console.log('\n--- STEP 6: Verify DB publication_status = draft ---');
  const dbDraftRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${testExperienceId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbDraftJson = await dbDraftRes.json();
  const draftRecord = Array.isArray(dbDraftJson.data) ? dbDraftJson.data.find((d: any) => d.id === testExperienceId) : dbDraftJson.data;
  console.log('Draft Record from DB:', draftRecord?.organization, '| Status:', draftRecord?.publicationStatus);
  if (draftRecord?.publicationStatus !== 'draft') {
    throw new Error(`Expected publicationStatus to be 'draft', got '${draftRecord?.publicationStatus}'`);
  }
  console.log('✓ Verified: DB publication_status is strictly "draft".');

  // Step 7: Verify it does NOT appear on public Engineering Timeline
  console.log('\n--- STEP 7: Verify Draft Does NOT Appear on Public Website ---');
  const publicRes = await fetch(`${SUPABASE_URL}/functions/v1/public-content?type=experience`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  const publicJson = await publicRes.json();
  const publicItems = Array.isArray(publicJson.data) ? publicJson.data : [];
  const foundInPublic = publicItems.some((item: any) => item.id === testExperienceId || item.organization === 'Quantum AI Robotics Institute');
  if (foundInPublic) {
    throw new Error('Draft experience record leaked into public content endpoint!');
  }
  console.log('✓ Verified: Draft experience record is NOT visible on public endpoint.');

  // Also navigate to public /experience page in browser to confirm
  await page.goto('http://localhost:5173/experience', { waitUntil: 'networkidle' });
  const publicPageText = await page.textContent('body');
  if (publicPageText?.includes('Quantum AI Robotics Institute')) {
    throw new Error('Draft experience is rendered on public /experience page!');
  }
  console.log('✓ Verified: Public /experience page does NOT render draft record.');

  // Step 8: Edit the record and Publish
  console.log('\n--- STEP 8: Return to /admin/experience, Edit Record & Click "Publish" ---');
  await page.goto('http://localhost:5173/admin/experience', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  // Locate the card and click Edit
  const draftCard = page.locator('div.p-5:has-text("Quantum AI Robotics Institute")');
  await draftCard.locator('button[title="Edit"]').click();

  // Modify overview text
  await page.waitForSelector('textarea', { timeout: 5000 });
  await page.locator('div.space-y-1\\.5:has(label:has-text("Overview & Scope")) textarea').fill('Leading quantum-accelerated robotics pipelines for next-gen aerospace systems (PUBLISHED PRODUCTION RELEASE).');

  // Click Publish in editor form
  capturedRequests.length = 0;
  const publishBtn = page.locator('div.shadow-lg button:has-text("Publish")');
  await publishBtn.click();
  await page.waitForTimeout(4000);

  const saveApprovedReq = capturedRequests.find(r => r.method === 'PUT' && r.url.includes('admin-content') && r.url.includes('type=experience'));
  const publishReq = capturedRequests.find(r => r.method === 'POST' && r.url.includes('admin-publish'));
  console.log(`Pre-publish Save Status: HTTP ${saveApprovedReq?.status}`);
  console.log(`Publish Endpoint Status: HTTP ${publishReq?.status}`);

  if (!publishReq || publishReq.status !== 200) {
    throw new Error(`Publish failed with status ${publishReq?.status}`);
  }
  console.log('✓ Verified: admin-publish returned HTTP 200.');

  // Step 9: Verify same UUID retained and DB publication_status = published
  console.log('\n--- STEP 9: Verify Same UUID Retained & DB publication_status = published ---');
  const dbPubRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${testExperienceId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbPubJson = await dbPubRes.json();
  const pubRecord = Array.isArray(dbPubJson.data) ? dbPubJson.data.find((d: any) => d.id === testExperienceId) : dbPubJson.data;
  console.log('Published Record from DB:', pubRecord?.organization, '| Status:', pubRecord?.publicationStatus);
  if (pubRecord?.publicationStatus !== 'published') {
    throw new Error(`Expected publicationStatus to be 'published', got '${pubRecord?.publicationStatus}'`);
  }
  console.log('✓ Verified: Same UUID retained and DB publication_status is "published".');

  // Step 10: Verify it now appears on public Engineering Timeline
  console.log('\n--- STEP 10: Verify Published Experience Appears on Public Website ---');
  const publicAfterPubRes = await fetch(`${SUPABASE_URL}/functions/v1/public-content?type=experience`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  const publicAfterPubJson = await publicAfterPubRes.json();
  const publicAfterPubItems = Array.isArray(publicAfterPubJson.data) ? publicAfterPubJson.data : [];
  const foundAfterPub = publicAfterPubItems.some((item: any) => item.id === testExperienceId || item.organization === 'Quantum AI Robotics Institute');
  if (!foundAfterPub) {
    throw new Error('Published experience record NOT found in public content endpoint!');
  }
  console.log('✓ Verified: Published experience record is visible on public endpoint.');

  // Verify public /experience page rendering
  await page.goto('http://localhost:5173/experience', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Quantum AI Robotics Institute', { timeout: 5000 });
  console.log('✓ Verified: Public /experience page renders published record.');

  // Step 11: Verify no duplicate records created
  console.log('\n--- STEP 11: Check for Duplicate Records in DB ---');
  const allExpFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allExpJson = await allExpFetch.json();
  const matchingRecords = (allExpJson.data || []).filter((r: any) => r.organization === 'Quantum AI Robotics Institute');
  console.log(`Matching records for test organization: ${matchingRecords.length}`);
  if (matchingRecords.length !== 1) {
    throw new Error(`Expected exactly 1 record for test organization, found ${matchingRecords.length}`);
  }
  console.log('✓ Verified: No duplicate records created.');

  // Step 12: Delete temporary record via UI delete button
  console.log('\n--- STEP 12: Delete Temporary Record via UI Delete Button ---');
  await page.goto('http://localhost:5173/admin/experience', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  capturedRequests.length = 0;
  const cardToDelete = page.locator('div.p-5:has-text("Quantum AI Robotics Institute")');
  await cardToDelete.locator('button[title="Delete"]').click();
  await page.waitForTimeout(3000);

  const deleteReq = capturedRequests.find(r => r.method === 'DELETE' && r.url.includes('admin-content') && r.url.includes('type=experience'));
  console.log(`Delete Request Status: HTTP ${deleteReq?.status}`);
  if (!deleteReq || deleteReq.status !== 200) {
    throw new Error(`Delete failed with status ${deleteReq?.status}`);
  }

  // Step 13: Verify UUID completely removed from DB
  console.log('\n--- STEP 13: Verify UUID Completely Removed from DB ---');
  const postDeleteCheck = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience&id=${testExperienceId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const postDeleteJson = await postDeleteCheck.json();
  const postDeleteList = Array.isArray(postDeleteJson.data) ? postDeleteJson.data : (postDeleteJson.data ? [postDeleteJson.data] : []);
  const stillExists = postDeleteList.some((d: any) => d.id === testExperienceId);
  if (stillExists) {
    throw new Error(`Experience UUID ${testExperienceId} still exists in DB after deletion!`);
  }
  console.log(`✓ Proof of Deletion: Experience UUID ${testExperienceId} completely removed from DB.`);

  // Step 14: Verify existing production experience records preserved
  console.log('\n--- STEP 14: Confirm Existing Production Records Preserved ---');
  const finalCheckFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=experience`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const finalCheckJson = await finalCheckFetch.json();
  const finalIds = (finalCheckJson.data || []).map((d: any) => d.id);
  console.log('Final remaining IDs in DB:', finalIds);

  const missingInitial = initialIds.filter(id => !finalIds.includes(id));
  if (missingInitial.length > 0) {
    throw new Error(`Production record was lost: ${JSON.stringify(missingInitial)}`);
  }
  console.log('✓ Proof of Preservation: All pre-existing production records intact.');

  await browser.close();

  console.log('\n================================================================');
  console.log('  ALL DRAFT -> PUBLISH WORKFLOW E2E TESTS PASSED SUCCESSFULLY');
  console.log('================================================================\n');
}

runExperienceDraftPublishFlow().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
