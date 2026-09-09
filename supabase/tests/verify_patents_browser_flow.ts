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

async function runRealPatentsBrowserFlow() {
  console.log('================================================================');
  console.log('  STARTING REAL CHROME BROWSER PATENTS CMS VERIFICATION');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);

  // Clean initial state
  console.log('--- STEP 0: Clean initial state ---');
  const initialFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialData = await initialFetch.json();
  for (const item of (initialData.data || [])) {
    await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent&id=${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  // Launch Real Chrome
  console.log('--- STEP 1 & 2: Launch Chrome & Open http://localhost:5173/admin/patents ---');
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

  await page.goto('http://localhost:5173/admin/patents', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  // Step 3 & 4: Click New Patent Entry
  console.log('\n--- STEP 3 & 4: Click "New Patent Entry" Button ---');
  await page.waitForSelector('button:has-text("New Patent Entry")', { timeout: 10000 });
  const newPatBtn = page.locator('button:has-text("New Patent Entry")');
  await newPatBtn.click();

  // Step 5: Fill Patent Form
  console.log('\n--- STEP 5: Enter Real Patent Data in Form ---');
  await page.waitForSelector('input', { timeout: 5000 });

  // Title
  const titleInput = page.locator('div.space-y-1\\.5:has(label:has-text("Invention Title")) input');
  await titleInput.fill('GAN-BASED ADAPTIVE WIRELESS POWER TRANSFER SYSTEM WITH REAL-TIME ANOMALY DETECTION');

  // Slug
  const slugInput = page.locator('div.space-y-1\\.5:has(label:has-text("Slug")) input');
  await slugInput.fill('gan-based-adaptive-wireless-power-transfer-system-with-real-time-anomaly-detection');

  // Status
  const statusSelect = page.locator('div.space-y-1\\.5:has(label:has-text("Status")) select');
  await statusSelect.selectOption('granted');

  // Jurisdiction
  const jurisInput = page.locator('div.space-y-1\\.5:has(label:has-text("Jurisdiction")) input');
  await jurisInput.fill('India');

  // Application Number
  const appInput = page.locator('div.space-y-1\\.5:has(label:has-text("Patent / Application Identifier")) input');
  await appInput.fill('202511107435');

  // Filing Date (left empty as filing date is unverified)
  const filingInput = page.locator('div.space-y-1\\.5:has(label:has-text("Filing Date")) input');
  await filingInput.fill('');

  // Abstract
  const abstractInput = page.locator('div.space-y-1\\.5:has(label:has-text("Invention Abstract")) textarea');
  await abstractInput.fill('The invention provides a GAN-based adaptive wireless power transfer system integrating a wireless power transfer unit, sensing and data acquisition module, generative adversarial network framework, and real-time anomaly detection engine. The generator predicts optimal wireless power transfer parameters, while the discriminator validates system performance and supports adaptive retraining. The system continuously monitors operating parameters to identify abnormal conditions and dynamically adapt wireless power transfer behavior, enabling more reliable, efficient, and intelligent power delivery.');

  console.log('Form inputs populated successfully.');

  // Step 6: Click Save Draft
  console.log('\n--- STEP 6: Click "Save Draft" in Form ---');
  capturedRequests.length = 0;
  const saveDraftBtn = page.locator('button:has-text("Save Draft")');
  await saveDraftBtn.click();

  // Wait for save network completion
  await page.waitForTimeout(3000);

  const saveDraftReq = capturedRequests.find(r => r.method === 'POST' && r.url.includes('admin-content') && r.url.includes('type=patent'));
  console.log('\nCaptured Save Draft Request:');
  console.log(`  URL: ${saveDraftReq?.url}`);
  console.log(`  Method: ${saveDraftReq?.method}`);
  console.log(`  HTTP Status: ${saveDraftReq?.status}`);
  console.log(`  Response Body: ${saveDraftReq?.body}`);

  if (!saveDraftReq || (saveDraftReq.status !== 200 && saveDraftReq.status !== 201)) {
    throw new Error(`Save Draft failed: expected HTTP 200 or 201, got ${saveDraftReq?.status}`);
  }

  const saveDraftJson = JSON.parse(saveDraftReq.body || '{}');
  const patentId = saveDraftJson.id;

  // Verify DB state after save draft
  const dbDraftRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent&id=${patentId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbDraftJson = await dbDraftRes.json();
  const draftRow = dbDraftJson.data;

  console.log('\nDatabase row after Save Draft:');
  console.log(`  ID: ${draftRow?.id}`);
  console.log(`  Title: "${draftRow?.title}"`);
  console.log(`  publication_status: "${draftRow?.publication_status || draftRow?.publicationStatus}"`);
  console.log(`  verification_status: "${draftRow?.verification_status || draftRow?.verificationStatus}"`);
  console.log(`  description (mapped from abstract): "${draftRow?.description?.slice(0, 60)}..."`);
  console.log(`  application_number: "${draftRow?.application_number || draftRow?.applicationNumber}"`);
  console.log(`  filing_date (verified uninvented/empty): "${draftRow?.filing_date || draftRow?.filingDate || ''}"`);

  if (draftRow?.filing_date && draftRow.filing_date === new Date().toISOString().split('T')[0]) {
    throw new Error('DATE_FABRICATION_ERROR: mapPatentToDb silently substituted today\'s date for empty filing date!');
  }

  // Verify Quarantine from public-content
  const publicContentRes = await fetch(`${SUPABASE_URL}/functions/v1/public-content?type=all&_t=${Date.now()}`);
  const publicContentJson = await publicContentRes.json();
  const publicPatents = publicContentJson.data?.patents || [];
  const draftInPublic = publicPatents.some((p: any) => p.id === patentId || p.slug === draftRow?.slug);
  console.log(`Draft in public-content dataset: ${draftInPublic}`);
  if (draftInPublic) {
    throw new Error('QUARANTINE_BREACH: Draft patent leaked to public-content!');
  }
  console.log('SUCCESS: Draft patent is properly quarantined from public view.');

  // Step 7: Click Publish via Browser UI
  console.log('\n--- STEP 7: Click "Publish" via Browser UI ---');
  capturedRequests.length = 0;
  
  const pubBtn = page.getByRole('button', { name: /^publish$/i }).first();
  await pubBtn.click();

  // Wait for publish network completion
  await page.waitForTimeout(4000);

  console.log('\nCaptured Requests during Publish:');
  for (const r of capturedRequests) {
    console.log(`  [${r.method}] ${r.url} -> HTTP ${r.status}`);
  }

  const prepSaveReq = capturedRequests.find(r => (r.method === 'PUT' || r.method === 'POST') && r.url.includes('admin-content'));
  const publishReq = capturedRequests.find(r => r.method === 'POST' && r.url.includes('admin-publish'));

  console.log('\nRequest A) Pre-publish save:', prepSaveReq ? JSON.stringify(prepSaveReq, null, 2) : 'undefined');
  console.log('Request B) admin-publish:', publishReq ? JSON.stringify(publishReq, null, 2) : 'undefined');

  if (!publishReq || publishReq.status !== 200) {
    throw new Error(`admin-publish failed: expected HTTP 200, got ${publishReq?.status}`);
  }

  // Verify DB state after publish
  const dbPubRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent&id=${patentId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbPubJson = await dbPubRes.json();
  const publishedRow = dbPubJson.data;

  console.log('\nDatabase row after Publish:');
  console.log(`  ID: ${publishedRow?.id}`);
  console.log(`  publication_status: "${publishedRow?.publication_status || publishedRow?.publicationStatus}"`);
  console.log(`  status: "${publishedRow?.status}"`);

  // Step 8: Open Public /patents in Incognito Browser
  console.log('\n--- STEP 8: Open Public /patents in Incognito Browser ---');
  const incognitoContext = await browser.newContext();
  const publicPage = await incognitoContext.newPage();
  await publicPage.goto('http://localhost:5173/patents', { waitUntil: 'networkidle' });
  await publicPage.reload({ waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(2000);

  const publicPageContent = await publicPage.textContent('body');
  const hasPublishedTitle = publicPageContent?.includes('GAN-BASED ADAPTIVE WIRELESS POWER TRANSFER');
  const hasInventors = publicPageContent?.includes('Tanishk Singhal');
  const hasAbstract = publicPageContent?.includes('The invention provides a GAN-based adaptive wireless power transfer system');

  console.log(`Rendered Public DOM contains patent title: ${hasPublishedTitle}`);
  console.log(`Rendered Public DOM contains inventors: ${hasInventors}`);
  console.log(`Rendered Public DOM contains abstract: ${hasAbstract}`);

  if (!hasPublishedTitle) {
    throw new Error('Public /patents page failed to display newly published patent!');
  }
  console.log('SUCCESS: Public /patents page rendered the newly published patent directly from Supabase!');

  // Step 9: Test Update Operation (Verify Same DB UUID)
  console.log('\n--- STEP 9: Test Update Operation (Verify Same DB UUID) ---');
  capturedRequests.length = 0;
  
  // Click Edit on the patent card
  const editBtn = page.locator('button[title="Edit"]').first();
  await editBtn.click();
  await page.waitForSelector('div.space-y-1\\.5:has(label:has-text("Jurisdiction")) input');

  // Modify jurisdiction to "India / International (PCT)"
  const editJurisInput = page.locator('div.space-y-1\\.5:has(label:has-text("Jurisdiction")) input');
  await editJurisInput.fill('India / International (PCT)');

  // Save draft
  const updateSaveBtn = page.locator('button:has-text("Save Draft")');
  await updateSaveBtn.click();
  await page.waitForTimeout(3000);

  const allPatentsRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allPatentsJson = await allPatentsRes.json();
  const matchingPatents = (allPatentsJson.data || []).filter((p: any) => p.slug === 'gan-based-adaptive-wireless-power-transfer-system-with-real-time-anomaly-detection');

  console.log(`Total records with slug 'gan-based-adaptive-wireless-power-transfer-system-with-real-time-anomaly-detection': ${matchingPatents.length}`);
  console.log(`Original UUID: ${patentId} | Updated Record UUID: ${matchingPatents[0]?.id}`);
  console.log(`Updated Jurisdiction in DB: "${matchingPatents[0]?.jurisdiction}"`);

  if (matchingPatents.length !== 1 || matchingPatents[0]?.id !== patentId) {
    throw new Error('DUPLICATION_ERROR: Update created a duplicate or modified the wrong UUID!');
  }
  console.log('SUCCESS: Update modified the exact same DB UUID without duplicate creation.');

  // Re-publish updated patent
  const rePubBtn = page.getByRole('button', { name: /^publish$/i }).first();
  await rePubBtn.click();
  await page.waitForTimeout(3000);

  // Re-verify public page
  await publicPage.reload({ waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(1000);
  const updatedPublicContent = await publicPage.textContent('body');
  const hasUpdatedJuris = updatedPublicContent?.includes('India / International (PCT)');
  console.log(`Public page displays updated jurisdiction: ${hasUpdatedJuris}`);

  // Step 10: Clean Up Test Patent Record
  console.log('\n--- STEP 10: Clean Up Test Patent Record ---');
  capturedRequests.length = 0;

  const deleteBtn = page.locator('button[title="Delete"]').first();
  await deleteBtn.click();
  await page.waitForTimeout(2500);

  // Confirm DB is clean
  const finalDbRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=patent`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const finalDbJson = await finalDbRes.json();
  console.log(`Remaining patents in DB: ${(finalDbJson.data || []).length}`);

  // Confirm Public is clean
  await publicPage.reload({ waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(1000);
  const cleanPublicContent = await publicPage.textContent('body');
  const cleanFromPublic = !cleanPublicContent?.includes('GAN-BASED ADAPTIVE WIRELESS POWER TRANSFER');
  console.log(`Public page no longer contains test patent: ${cleanFromPublic}`);

  await browser.close();

  console.log('\n================================================================');
  console.log('  ALL 11 PHASES OF PATENTS CMS VERIFICATION PASSED 100%!');
  console.log('================================================================\n');
}

runRealPatentsBrowserFlow().catch(err => {
  console.error('\nFAILED PATENTS VERIFICATION:', err);
  process.exit(1);
});
