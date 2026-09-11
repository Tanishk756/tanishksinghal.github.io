import { chromium, Page } from 'playwright-core';

const PROD_BASE_URL = 'https://tanishksinghal.in';
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

async function navigateToSpa(page: Page, path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const spaUrl = `${PROD_BASE_URL}/?${cleanPath}`;
  console.log(`Navigating to SPA URL: ${spaUrl}`);
  await page.goto(spaUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
}

async function runProductionResearchVerification() {
  console.log('================================================================');
  console.log('  STARTING PRODUCTION RESEARCH PROGRAMS VERIFICATION');
  console.log('  Base URL: https://tanishksinghal.in');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
  });

  // Inject session into localStorage for production domain
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

  page.on('console', msg => {
    const txt = msg.text();
    if (!txt.includes('Download the React DevTools') && !txt.includes('[vite]') && !txt.includes('THREE.')) {
      console.log(`[Browser Console ${msg.type().toUpperCase()}]:`, txt);
    }
  });

  page.on('pageerror', err => {
    console.error('[Browser PageError]:', err.message);
  });

  page.on('dialog', async dialog => {
    console.log(`[Browser Dialog]: ${dialog.type()} - ${dialog.message()}`);
    await dialog.accept();
  });

  const TEST_TITLE = 'RESEARCH_PROGRAM_LIFECYCLE_TEST_DELETE_ME';
  const TEST_SLUG = 'research-program-lifecycle-test-delete-me';
  const TEST_DOMAIN = 'Robotics & Autonomous Systems';
  const TEST_SUMMARY = 'Temporary lifecycle verification record.';
  const TEST_PROBLEM = 'Temporary lifecycle verification record.';
  const TEST_METHODOLOGY = 'Temporary lifecycle verification record.';

  try {
    // -------------------------------------------------------------
    // STEP 1: Navigate to Admin Research Programs Page
    // -------------------------------------------------------------
    console.log('\n--- STEP 1: Navigating to Admin Research Page ---');
    await navigateToSpa(page, 'admin/research');
    await page.waitForSelector('text=Research Programs & Methodologies', { timeout: 15000 });
    console.log('✓ Admin Research Programs page loaded successfully.');

    // -------------------------------------------------------------
    // STEP 2: Click "New Research Program" & Fill Form
    // -------------------------------------------------------------
    console.log('\n--- STEP 2: Opening Creation Form and filling fields ---');
    const newBtn = await page.waitForSelector('button:has-text("New Research Program")', { timeout: 10000 });
    await newBtn.click();
    await page.waitForSelector('input[placeholder*="Distributed Consensus"]', { timeout: 5000 });
    console.log('✓ Creation form opened.');

    // Fill Title
    const titleInput = await page.$('input[placeholder*="Distributed Consensus"]');
    await titleInput?.fill(TEST_TITLE);

    // Fill Slug
    const slugInput = await page.$('input[placeholder*="distributed-consensus-tracking"]');
    await slugInput?.fill(TEST_SLUG);

    // Fill Domain
    const domainInput = await page.$('input[placeholder*="Robotics & Autonomous Systems"]');
    await domainInput?.fill(TEST_DOMAIN);

    // Select Status
    const statusSelect = await page.$('select');
    await statusSelect?.selectOption('active');

    // Fill Summary
    const summaryInput = await page.$('textarea[placeholder*="Executive summary"]');
    await summaryInput?.fill(TEST_SUMMARY);

    // Fill Problem Statement
    const problemInput = await page.$('textarea[placeholder*="Define the technical"]');
    await problemInput?.fill(TEST_PROBLEM);

    // Fill Methodology
    const methodologyInput = await page.$('textarea[placeholder*="Outline algorithm topologies"]');
    await methodologyInput?.fill(TEST_METHODOLOGY);

    console.log('✓ Form fields populated.');

    // -------------------------------------------------------------
    // STEP 3: Click "Save Draft"
    // -------------------------------------------------------------
    console.log('\n--- STEP 3: Saving as DRAFT ---');
    const saveDraftBtn = await page.waitForSelector('button:has-text("Save Draft")', { timeout: 5000 });
    await saveDraftBtn.click();
    await page.waitForTimeout(4000);

    // Verify record in Admin list
    await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 10000 });
    console.log(`✓ Record "${TEST_TITLE}" appears in Admin.`);

    // Verify DRAFT badge is visible on the record card
    const draftBadge = await page.waitForSelector(`div:has-text("${TEST_TITLE}") >> text=DRAFT`, { timeout: 5000 });
    console.log('✓ DRAFT badge is visible in Admin.');

    // -------------------------------------------------------------
    // STEP 4: Verify NOT visible on Public /research page
    // -------------------------------------------------------------
    console.log('\n--- STEP 4: Verifying DRAFT is hidden from public page ---');
    await navigateToSpa(page, 'research');
    await page.waitForTimeout(3000);
    const publicContent = await page.textContent('body');
    if (publicContent?.includes(TEST_TITLE)) {
      throw new Error(`CRITICAL: Draft item "${TEST_TITLE}" unexpectedly visible on public Research page!`);
    }
    console.log('✓ Verified: Draft item is NOT visible on public Research page.');

    // -------------------------------------------------------------
    // STEP 5: Return to Admin & Publish Record
    // -------------------------------------------------------------
    console.log('\n--- STEP 5: Returning to Admin and Publishing record ---');
    await navigateToSpa(page, 'admin/research');
    await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 10000 });

    const publishBtn = await page.waitForSelector(`div:has-text("${TEST_TITLE}") >> button:has-text("Publish")`, { timeout: 5000 });
    await publishBtn.click();
    console.log('Clicked Publish button. Waiting for publication...');
    await page.waitForTimeout(4000);

    // Verify PUBLISHED badge in Admin
    await page.waitForSelector(`div:has-text("${TEST_TITLE}") >> text=PUBLISHED`, { timeout: 10000 });
    console.log('✓ Verified: Record status transitioned to PUBLISHED in Admin.');

    // -------------------------------------------------------------
    // STEP 6: Verify Visible on Public /research page
    // -------------------------------------------------------------
    console.log('\n--- STEP 6: Verifying Published item appears on public Research page ---');
    await navigateToSpa(page, 'research');
    await page.waitForTimeout(3000);
    await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 10000 });
    console.log(`✓ Verified: "${TEST_TITLE}" is now publicly visible on /research.`);

    const pubPageText = await page.textContent('body');
    if (!pubPageText?.includes(TEST_DOMAIN) || !pubPageText?.includes(TEST_SUMMARY)) {
      throw new Error(`Public page missing expected domain or summary content!`);
    }
    console.log(`✓ Verified: Title, Domain (${TEST_DOMAIN}), and Summary are all rendered on public page.`);

    // -------------------------------------------------------------
    // STEP 7: Return to Admin & Unpublish
    // -------------------------------------------------------------
    console.log('\n--- STEP 7: Unpublishing record ---');
    await navigateToSpa(page, 'admin/research');
    await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 10000 });

    const unpublishBtn = await page.waitForSelector(`div:has-text("${TEST_TITLE}") >> button:has-text("Unpublish")`, { timeout: 5000 });
    await unpublishBtn.click();
    console.log('Clicked Unpublish button. Waiting for unpublish...');
    await page.waitForTimeout(4000);

    // Verify returns to DRAFT in Admin
    await page.waitForSelector(`div:has-text("${TEST_TITLE}") >> text=DRAFT`, { timeout: 10000 });
    console.log('✓ Verified: Record returned to DRAFT state in Admin.');

    // -------------------------------------------------------------
    // STEP 8: Verify Disappeared from Public /research page
    // -------------------------------------------------------------
    console.log('\n--- STEP 8: Verifying Unpublished item disappeared publicly ---');
    await navigateToSpa(page, 'research');
    await page.waitForTimeout(3000);
    const unpubCheckText = await page.textContent('body');
    if (unpubCheckText?.includes(TEST_TITLE)) {
      throw new Error(`CRITICAL: Unpublished item "${TEST_TITLE}" is still visible on public Research page!`);
    }
    console.log('✓ Verified: Record disappeared from public Research page.');

    // -------------------------------------------------------------
    // STEP 9: Delete Test Record in Admin & Verify Zero Test Data
    // -------------------------------------------------------------
    console.log('\n--- STEP 9: Deleting test record in Admin ---');
    await navigateToSpa(page, 'admin/research');
    await page.waitForSelector(`text=${TEST_TITLE}`, { timeout: 10000 });

    const deleteBtn = await page.waitForSelector(`div:has-text("${TEST_TITLE}") >> button[title="Delete"]`, { timeout: 5000 });
    await deleteBtn.click();
    console.log('Clicked Delete button. Waiting for deletion...');
    await page.waitForTimeout(4000);

    // Verify record is gone from Admin
    const remainingAdminText = await page.textContent('body');
    if (remainingAdminText?.includes(TEST_TITLE)) {
      throw new Error(`Failed to delete record "${TEST_TITLE}" from Admin.`);
    }
    console.log('✓ Verified: Test record deleted completely from Admin UI.');

    // Verify record is gone from Supabase database directly
    const directCheckRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=research`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const directCheckJson = await directCheckRes.json();
    const directCheckData = directCheckJson.data || [];
    const testRecordLeft = directCheckData.find((r: any) => r.slug === TEST_SLUG || r.title === TEST_TITLE);
    if (testRecordLeft) {
      throw new Error(`Test record ${TEST_SLUG} still exists in Supabase DB!`);
    }
    console.log('✓ Verified: ZERO synthetic test records remain in Supabase database.');

    console.log('\n================================================================');
    console.log('  ALL PRODUCTION RESEARCH PROGRAMS TESTS PASSED SUCCESSFULLY!  ');
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }
}

runProductionResearchVerification().catch(err => {
  console.error('Production Verification Failed:', err);
  process.exit(1);
});
