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

async function runRealSkillsBrowserVerification() {
  console.log('================================================================');
  console.log('  STARTING REAL CHROME BROWSER SKILLS CMS VERIFICATION');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);

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

  page.on('console', msg => {
    const txt = msg.text();
    if (!txt.includes('Download the React DevTools') && !txt.includes('[vite]')) {
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

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('/functions/v1/')) {
      let body = '';
      try { body = await resp.text(); } catch (e) {}
      const req = resp.request();
      console.log(`[DevTools Network]: ${req.method()} ${url} -> HTTP ${resp.status()} | ${body.slice(0, 200)}`);
    }
  });

  // STEP 0: Clean any previous leftover test skills
  console.log('--- STEP 0: Clean leftover test items ---');
  const initialFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialData = await initialFetch.json();
  for (const item of (initialData.data || [])) {
    if (item.name === 'SKILLS_LIFECYCLE_TEST_DELETE_ME' || item.name?.startsWith('TEST_')) {
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill&id=${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  }

  // STEP 1: Navigate to Admin Skills Matrix
  console.log('--- STEP 1: Open http://localhost:5173/admin/skills in Chrome ---');
  await page.goto('http://localhost:5173/admin/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // STEP 2: Verify 7 Categories Rendered in Admin
  console.log('\n--- STEP 2: Verify 7 Canonical Categories in Admin ---');
  const categoryHeaders = await page.$$eval('h4.uppercase', els => els.map(e => e.textContent?.trim()));
  console.log('Admin Rendered Category Headers:', categoryHeaders);

  const expectedCategories = [
    'Robotics & Control',
    'Autonomous Systems',
    'AI & ML',
    'Firmware & Embedded',
    'Hardware & Circuits',
    'Space Systems & UAV',
    'Software & Tools'
  ];

  if (categoryHeaders.length !== 7) {
    throw new Error(`Expected 7 category headers in Admin, found ${categoryHeaders.length}: ${JSON.stringify(categoryHeaders)}`);
  }

  for (let i = 0; i < expectedCategories.length; i++) {
    if (categoryHeaders[i] !== expectedCategories[i]) {
      throw new Error(`Category header mismatch at index ${i}: expected "${expectedCategories[i]}", got "${categoryHeaders[i]}"`);
    }
    console.log(`  [OK] Header 0${i + 1} // ${categoryHeaders[i]}`);
  }

  // STEP 3: Verify Category Dropdown in Form has 7 Options
  console.log('\n--- STEP 3: Verify Category Dropdown in Form ---');
  const dropdownOptions = await page.$$eval('select option', els => els.map(e => ({ value: e.getAttribute('value'), text: e.textContent?.trim() })));
  console.log('Form Dropdown Options:', dropdownOptions);

  if (dropdownOptions.length !== 7) {
    throw new Error(`Expected 7 dropdown options, found ${dropdownOptions.length}`);
  }

  for (let i = 0; i < expectedCategories.length; i++) {
    if (dropdownOptions[i].value !== expectedCategories[i]) {
      throw new Error(`Dropdown option mismatch at index ${i}: expected "${expectedCategories[i]}", got "${dropdownOptions[i].value}"`);
    }
  }
  console.log('Category dropdown contains all 7 canonical categories in exact order (OK).');

  // STEP 4: Verify 27 Existing Draft Skills in Admin
  console.log('\n--- STEP 4: Verify Existing Draft Skills in Admin ---');
  const draftBadges = await page.$$eval('span', els => els.filter(e => e.textContent?.trim() === 'DRAFT').length);
  console.log(`Total [DRAFT] badges visible in Admin: ${draftBadges}`);

  const allSkillNames = await page.$$eval('.font-semibold.text-slate-900', els => els.map(e => e.textContent?.trim()));
  console.log(`Total skill item cards in Admin: ${allSkillNames.length}`);
  console.log('Rendered skill names sample:', allSkillNames.slice(0, 5), '...');

  if (allSkillNames.length !== 27) {
    throw new Error(`Expected 27 skill items in Admin, found ${allSkillNames.length}`);
  }
  console.log('All 27 existing draft skills are displayed in Admin (OK).');

  // STEP 5: Create New Draft Skill via Form
  console.log('\n--- STEP 5: Create New Draft Skill (SKILLS_LIFECYCLE_TEST_DELETE_ME) ---');
  await page.fill('input[placeholder="e.g. ROS 2 (Humble)"]', 'SKILLS_LIFECYCLE_TEST_DELETE_ME');
  await page.selectOption('select', 'Autonomous Systems');
  await page.fill('input[placeholder="e.g. Node Architecture, Kinematics"]', 'Lifecycle Verification');

  // Click Save Draft
  const saveDraftBtn = await page.waitForSelector('button:has-text("Save Draft")');
  await saveDraftBtn.click();
  await page.waitForTimeout(2000);

  // Verify it appears in Admin with DRAFT badge
  const testSkillAdminDraft = await page.$('text=SKILLS_LIFECYCLE_TEST_DELETE_ME');
  if (!testSkillAdminDraft) {
    throw new Error('Test skill not found in Admin after Save Draft!');
  }
  console.log('Test skill appears in Admin after Save Draft (OK).');

  // STEP 6: Verify Public Page Does NOT Show Draft Skill
  console.log('\n--- STEP 6: Check Public Skills Page (/skills) ---');
  await page.goto('http://localhost:5173/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const publicTestSkill = await page.$('text=SKILLS_LIFECYCLE_TEST_DELETE_ME');
  if (publicTestSkill) {
    throw new Error('Draft test skill was incorrectly visible on the public skills page!');
  }
  console.log('Draft test skill is NOT visible on public skills page (OK).');

  // Verify 7 categories exist on public page
  const publicCategories = await page.$$eval('h2, h3', els => els.map(e => e.textContent?.trim()).filter(t => expectedCategories.some(c => t?.includes(c))));
  console.log('Public page category sections detected:', publicCategories);

  // STEP 7: Publish Test Skill from Admin
  console.log('\n--- STEP 7: Publish Test Skill from Admin ---');
  await page.goto('http://localhost:5173/admin/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Find the row for SKILLS_LIFECYCLE_TEST_DELETE_ME and click Publish
  const testCard = await page.locator('.p-3.rounded-xl:has-text("SKILLS_LIFECYCLE_TEST_DELETE_ME")');
  const publishBtn = testCard.locator('button:has-text("Publish")');
  await publishBtn.click();

  // Wait for the badge to transition to PUBLISHED
  await page.waitForSelector('.p-3.rounded-xl:has-text("SKILLS_LIFECYCLE_TEST_DELETE_ME") span:has-text("PUBLISHED")', { timeout: 15000 });
  console.log('Test skill badge in Admin transitioned to PUBLISHED (OK).');

  // STEP 8: Verify Published Skill Appears on Public Page
  console.log('\n--- STEP 8: Verify Published Skill Appears on Public Page ---');
  await page.goto('http://localhost:5173/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.waitForSelector('text=SKILLS_LIFECYCLE_TEST_DELETE_ME', { timeout: 10000 });
  console.log('Test skill is visible on public page (OK).');

  const subdisciplineVisible = await page.locator('text=Lifecycle Verification').isVisible();
  console.log('Subdiscipline "Lifecycle Verification" visible on public page:', subdisciplineVisible);
  if (!subdisciplineVisible) {
    throw new Error('Subdiscipline not rendered on public page!');
  }
  console.log('Published skill is visible on public page with correct subdiscipline under Autonomous Systems (OK).');

  // STEP 9: Unpublish Test Skill from Admin
  console.log('\n--- STEP 9: Unpublish Test Skill from Admin ---');
  await page.goto('http://localhost:5173/admin/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const testCardPub = await page.locator('.p-3.rounded-xl:has-text("SKILLS_LIFECYCLE_TEST_DELETE_ME")');
  const unpublishBtn = testCardPub.locator('button:has-text("Unpublish")');
  await unpublishBtn.click();

  // Wait for badge to return to DRAFT
  await page.waitForSelector('.p-3.rounded-xl:has-text("SKILLS_LIFECYCLE_TEST_DELETE_ME") span:has-text("DRAFT")', { timeout: 15000 });
  console.log('Test skill badge reverted to DRAFT in Admin (OK).');

  // STEP 10: Verify Unpublished Skill Disappeared from Public Page
  console.log('\n--- STEP 10: Verify Unpublished Skill Disappeared Publicly ---');
  await page.goto('http://localhost:5173/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const publicUnpublishedSkill = await page.locator('text=SKILLS_LIFECYCLE_TEST_DELETE_ME').isVisible();
  console.log('Test skill visible on public page after unpublish:', publicUnpublishedSkill);
  if (publicUnpublishedSkill) {
    throw new Error('Unpublished test skill is still visible publicly!');
  }
  console.log('Unpublished test skill disappeared from public page (OK).');

  // STEP 11: Delete Test Skill from Admin
  console.log('\n--- STEP 11: Delete Test Skill from Admin ---');
  await page.goto('http://localhost:5173/admin/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const testCardDel = await page.locator('.p-3.rounded-xl:has-text("SKILLS_LIFECYCLE_TEST_DELETE_ME")');
  const deleteBtn = testCardDel.locator('button[title="Delete Skill"]');
  await deleteBtn.click();
  await page.waitForTimeout(2500);

  // Verify test skill is removed from Admin
  const testSkillStillPresent = await page.locator('text=SKILLS_LIFECYCLE_TEST_DELETE_ME').isVisible();
  if (testSkillStillPresent) {
    throw new Error('Test skill was not deleted from Admin!');
  }
  console.log('Test skill deleted cleanly from Admin (OK).');

  // STEP 12: Verify All 27 Original Draft Skills Intact
  console.log('\n--- STEP 12: Verify 27 Original Skills Preserved ---');
  const finalSkillsCount = await page.$$eval('.font-semibold.text-slate-900', els => els.length);
  console.log(`Final total skills count in Admin: ${finalSkillsCount}`);
  if (finalSkillsCount !== 27) {
    throw new Error(`Expected exactly 27 original skills in Admin, found ${finalSkillsCount}`);
  }
  console.log('All 27 original draft skills remain intact in Admin (OK).');

  await browser.close();

  console.log('\n================================================================');
  console.log('  REAL CHROME BROWSER VERIFICATION PASSED WITH 100% SUCCESS');
  console.log('================================================================\n');
}

runRealSkillsBrowserVerification().catch(err => {
  console.error('\n*** Real Browser Verification FAILED ***:', err);
  process.exit(1);
});
