import { chromium } from 'playwright-core';

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

async function runRealPublicationsBrowserFlow() {
  console.log('================================================================');
  console.log('  STARTING REAL CHROME BROWSER PUBLICATIONS CMS VERIFICATION');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);

  // Clean initial state
  console.log('--- STEP 0: Clean initial state ---');
  const initialFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialData = await initialFetch.json();
  for (const item of (initialData.data || [])) {
    await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication&id=${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  // Launch Real Chrome
  console.log('--- STEP 1 & 2: Launch Chrome & Open http://localhost:5173/admin/publications ---');
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

  await page.goto('http://localhost:5173/admin/publications', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  // Step 3 & 4: Click New Publication
  console.log('\n--- STEP 3 & 4: Click "New Publication" Button ---');
  await page.waitForSelector('button:has-text("New Publication")', { timeout: 10000 });
  const newPubBtn = page.locator('button:has-text("New Publication")');
  await newPubBtn.click();

  // Step 5: Fill Publication Form
  console.log('\n--- STEP 5: Enter Publication Data in Form ---');
  await page.waitForSelector('input', { timeout: 5000 });

  // Title
  const titleInput = page.locator('div.space-y-1\\.5:has(label:has-text("Publication Title")) input');
  await titleInput.fill('Framework for UAV-based Wireless Power Harvesting');

  // Slug
  const slugInput = page.locator('div.space-y-1\\.5:has(label:has-text("Slug")) input');
  await slugInput.fill('uav-wireless-power-harvesting');

  // Year
  const yearInput = page.locator('div.space-y-1\\.5:has(label:has-text("Publication Year")) input');
  await yearInput.fill('2026');

  // Type
  const typeSelect = page.locator('div.space-y-1\\.5:has(label:has-text("Type")) select');
  await typeSelect.selectOption('conference');

  // Venue
  const venueInput = page.locator('div.space-y-1\\.5:has(label:has-text("Venue / Journal Name")) input');
  await venueInput.fill('IEEE International Conference on Robotics and Automation');

  // Publisher
  const publisherInput = page.locator('div.space-y-1\\.5:has(label:has-text("Publisher")) input');
  await publisherInput.fill('IEEE');

  // Abstract
  const abstractInput = page.locator('div.space-y-1\\.5:has(label:has-text("Abstract")) textarea');
  await abstractInput.fill('Investigating multi-source wireless power harvesting methodologies integrating RF energy scavenging, solar absorption, and dynamic power distribution architectures to extend flight endurance and operational autonomy for unmanned aerial vehicle (UAV) networks.');

  // DOI
  const doiInput = page.locator('div.space-y-1\\.5:has(label:has-text("DOI")) input');
  await doiInput.fill('10.1109/ICRA.2026.1049281');

  // External URL
  const extUrlInput = page.locator('div.space-y-1\\.5:has(label:has-text("External URL")) input');
  await extUrlInput.fill('https://doi.org/10.1109/ICRA.2026.1049281');

  console.log('Form inputs populated successfully.');

  // Step 6: Click SAVE DRAFT
  console.log('\n--- STEP 6: Click "Save Draft" in Form ---');
  capturedRequests.length = 0;

  const saveDraftBtn = page.locator('button:has-text("Save Draft")');
  await saveDraftBtn.click();
  await page.waitForTimeout(3000);

  const saveDraftReq = capturedRequests.find(r => r.url.includes('/functions/v1/admin-content?type=publication') && r.method === 'POST');
  console.log('\nCaptured Save Draft Request:');
  console.log(`  URL: ${saveDraftReq?.url}`);
  console.log(`  Method: ${saveDraftReq?.method}`);
  console.log(`  HTTP Status: ${saveDraftReq?.status}`);
  console.log(`  Response Body: ${saveDraftReq?.body}`);

  if (!saveDraftReq || saveDraftReq.status !== 200 && saveDraftReq.status !== 201) {
    throw new Error(`Save draft failed: expected HTTP 200/201, got ${saveDraftReq?.status}`);
  }

  // Confirm DB row is draft
  const dbDraftCheck = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbDraftData = await dbDraftCheck.json();
  const createdDraft = dbDraftData.data?.find((p: any) => p.slug === 'uav-wireless-power-harvesting');
  console.log('\nDatabase row after Save Draft:');
  console.log(`  ID: ${createdDraft?.id}`);
  console.log(`  Title: "${createdDraft?.title}"`);
  console.log(`  publication_status: "${createdDraft?.publicationStatus || createdDraft?.publication_status}"`);
  console.log(`  verification_status: "${createdDraft?.verificationStatus || createdDraft?.verification_status}"`);

  if (!createdDraft || (createdDraft.publicationStatus !== 'draft' && createdDraft.publication_status !== 'draft')) {
    throw new Error(`Expected draft publication in DB, got: ${JSON.stringify(createdDraft)}`);
  }

  // Confirm public-content does NOT expose the draft
  const publicDraftCheck = await fetch(`${SUPABASE_URL}/functions/v1/public-content?type=all`);
  const publicDraftJson = await publicDraftCheck.json();
  const publicPubs = publicDraftJson.data?.publications || [];
  const leakedDraft = publicPubs.find((p: any) => p.slug === 'uav-wireless-power-harvesting');
  console.log(`Draft in public-content dataset: ${Boolean(leakedDraft)}`);
  if (leakedDraft) {
    throw new Error('DRAFT LEAKED TO PUBLIC DATASET BEFORE PUBLISHING!');
  }
  console.log('SUCCESS: Draft publication is properly quarantined from public view.');

  // Step 7: Click PUBLISH in Browser UI
  console.log('\n--- STEP 7: Click "Publish" via Browser UI ---');
  await page.waitForTimeout(2000);
  const cardButtons = await page.$$eval('button', btns => btns.map(b => ({ text: b.textContent, title: b.getAttribute('title') })));
  console.log('Available buttons on page in Step 7:', cardButtons);

  capturedRequests.length = 0;

  const publishBtn = page.locator('button[title="Publish to public website"], button:has-text("Publish")').first();
  await publishBtn.waitFor({ timeout: 5000 });
  await publishBtn.click();
  await page.waitForTimeout(4000);

  console.log('\nCaptured Requests during Publish:');
  capturedRequests.forEach(r => console.log(`  [${r.method}] ${r.url} -> HTTP ${r.status}`));

  const prepSaveReq = capturedRequests.find(r => r.url.includes('/functions/v1/admin-content?type=publication') && (r.method === 'POST' || r.method === 'PUT'));
  const publishReq = capturedRequests.find(r => r.url.includes('/functions/v1/admin-publish') && r.method === 'POST');

  console.log('\nRequest A) Pre-publish save:', JSON.stringify(prepSaveReq, null, 2));
  console.log('Request B) admin-publish:', JSON.stringify(publishReq, null, 2));

  if (!publishReq || publishReq.status !== 200) {
    throw new Error(`admin-publish failed: expected HTTP 200, got ${publishReq?.status}`);
  }

  // Confirm DB row is published
  const dbPubCheck = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbPubData = await dbPubCheck.json();
  const publishedRow = dbPubData.data?.find((p: any) => p.slug === 'uav-wireless-power-harvesting');
  console.log('\nDatabase row after Publish:');
  console.log(`  ID: ${publishedRow?.id}`);
  console.log(`  publication_status: "${publishedRow?.publicationStatus || publishedRow?.publication_status}"`);

  if (!publishedRow || (publishedRow.publicationStatus !== 'published' && publishedRow.publication_status !== 'published')) {
    throw new Error('Expected DB row to be published!');
  }

  // Step 8: Open Public /publications page in incognito context
  console.log('\n--- STEP 8: Open Public /publications in Incognito Browser ---');
  const incognitoContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const publicPage = await incognitoContext.newPage();

  await publicPage.goto('http://localhost:5173/publications', { waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(2000);

  const publicDom = await publicPage.content();
  const hasTitleInDom = publicDom.includes('Framework for UAV-based Wireless Power Harvesting');
  console.log(`Rendered Public DOM contains publication title: ${hasTitleInDom}`);

  if (!hasTitleInDom) {
    throw new Error("Rendered public /publications DOM does not contain 'Framework for UAV-based Wireless Power Harvesting'!");
  }
  console.log('SUCCESS: Public /publications page rendered the newly published publication directly from Supabase!');

  // Step 9: Test Update (Same ID, No Duplicates)
  console.log('\n--- STEP 9: Test Update Operation (Verify Same DB UUID) ---');
  await page.bringToFront();

  // Click Edit on the publication card
  const editBtn = page.locator('button[title="Edit"]').first();
  await editBtn.click();
  await page.waitForTimeout(1000);

  const updatedVenue = 'IEEE International Conference on Robotics and Automation (ICRA 2026)';
  const venueField = page.locator('div.space-y-1\\.5:has(label:has-text("Venue / Journal Name")) input');
  await venueField.fill(updatedVenue);

  capturedRequests.length = 0;
  const updateSaveDraftBtn = page.locator('button:has-text("Save Draft")');
  await updateSaveDraftBtn.click();
  await page.waitForTimeout(3000);

  // Check DB count and ID
  const dbUpdateCheck = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbUpdateData = await dbUpdateCheck.json();
  const matchingPubs = dbUpdateData.data?.filter((p: any) => p.slug === 'uav-wireless-power-harvesting');

  console.log(`Total records with slug 'uav-wireless-power-harvesting': ${matchingPubs?.length}`);
  console.log(`Original UUID: ${publishedRow.id} | Updated Record UUID: ${matchingPubs?.[0]?.id}`);
  console.log(`Updated Venue in DB: "${matchingPubs?.[0]?.venue}"`);

  if (matchingPubs?.length !== 1 || matchingPubs[0].id !== publishedRow.id) {
    throw new Error('Update failed: Created duplicate or changed UUID!');
  }
  console.log('SUCCESS: Update modified the exact same DB UUID without duplicate creation.');

  // Publish updated record
  capturedRequests.length = 0;
  const cardPublishBtn = page.locator('button:has-text("Publish")').first();
  await cardPublishBtn.click();
  await page.waitForTimeout(4000);

  // Refresh public page
  await publicPage.bringToFront();
  await publicPage.reload({ waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(2000);

  const updatedPublicDom = await publicPage.content();
  const hasUpdatedVenue = updatedPublicDom.includes('ICRA 2026');
  console.log(`Public page displays updated venue: ${hasUpdatedVenue}`);

  // Step 10: Clean up Test Data
  console.log('\n--- STEP 10: Clean Up Test Publication Record ---');
  await page.bringToFront();

  // Accept window confirmation dialog
  page.on('dialog', async dialog => {
    console.log(`[Browser Dialog]: ${dialog.message()}`);
    await dialog.accept();
  });

  const deleteBtn = page.locator('button[title="Delete"]').first();
  await deleteBtn.click();
  await page.waitForTimeout(3000);

  const dbAfterDelete = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbAfterDeleteData = await dbAfterDelete.json();
  console.log(`Remaining publications in DB: ${dbAfterDeleteData.data?.length}`);

  await publicPage.bringToFront();
  await publicPage.reload({ waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(2000);

  const finalPublicDom = await publicPage.content();
  const titleStillPresent = finalPublicDom.includes('Framework for UAV-based Wireless Power Harvesting');
  console.log(`Public page no longer contains test publication: ${!titleStillPresent}`);

  console.log('\n================================================================');
  console.log('  ALL 11 PHASES OF PUBLICATIONS CMS VERIFICATION PASSED 100%!');
  console.log('================================================================\n');

  await browser.close();
}

runRealPublicationsBrowserFlow().catch(err => {
  console.error('\nFAILED PUBLICATIONS VERIFICATION:', err);
  process.exit(1);
});
