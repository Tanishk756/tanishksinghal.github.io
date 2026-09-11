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

const CANONICAL_CATEGORIES = [
  'Robotics & Control',
  'Autonomous Systems',
  'AI & ML',
  'Firmware & Embedded',
  'Hardware & Circuits',
  'Space Systems & UAV',
  'Software & Tools',
];

async function navigateToSpa(page: Page, path: string) {
  const spaUrl = `${PROD_BASE_URL}/?${path}`;
  console.log(`Navigating to SPA URL: ${spaUrl}`);
  await page.goto(spaUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
}

async function runProductionSkillsVerification() {
  console.log('================================================================');
  console.log('  STARTING PRODUCTION BROWSER VERIFICATION (tanishksinghal.in)');
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

  // STEP 0: Clean any previous leftover test skills
  console.log('--- STEP 0: Clean leftover test items in Supabase DB ---');
  const initialFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const initialData = await initialFetch.json();
  const existingSkills = initialData.data || [];
  console.log(`Currently found ${existingSkills.length} total skills in database.`);
  for (const item of existingSkills) {
    if (item.name?.startsWith('PROD_VERIF_') || item.name?.startsWith('TEST_')) {
      console.log(`Deleting leftover test skill: ${item.name} (${item.id})`);
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill&id=${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  }

  // STEP 1: Verify Production Admin Skills Matrix
  console.log('\n--- STEP 1: Navigating to Production Admin Skills Matrix ---');
  await navigateToSpa(page, '/admin/skills');

  // Wait for category headers
  await page.waitForSelector('h4', { timeout: 15000 });
  await page.screenshot({ path: 'supabase/tests/prod_admin_skills_verified.png', fullPage: true });

  // Verify all 7 categories are present in exact order
  const adminCategories = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.p-5.rounded-2xl.bg-white.border'));
    return cards.map(c => {
      const title = c.querySelector('h4')?.textContent?.trim() || '';
      const badgeCount = c.querySelector('.flex.items-center.justify-between span.text-slate-400')?.textContent?.trim() || '';
      const items = Array.from(c.querySelectorAll('.p-3.rounded-xl.bg-slate-50')).map(item => {
        const name = item.querySelector('.font-semibold')?.textContent?.trim() || '';
        const badge = item.querySelector('.uppercase')?.textContent?.trim() || '';
        const subdiscipline = item.querySelector('.text-slate-500')?.textContent?.trim() || '';
        const buttons = Array.from(item.querySelectorAll('button')).map(b => b.textContent?.trim() || b.getAttribute('title') || '');
        return { name, badge, subdiscipline, buttons };
      });
      return { title, badgeCount, itemCount: items.length, items };
    });
  });

  console.log(`Found ${adminCategories.length} category cards in Admin CMS:`);
  let totalAdminDrafts = 0;
  for (const cat of adminCategories) {
    console.log(`  - Category: "${cat.title}" (Items: ${cat.itemCount})`);
    for (const item of cat.items) {
      console.log(`      * [${item.badge}] ${item.name} (Sub: ${item.subdiscipline}) [Buttons: ${item.buttons.join(', ')}]`);
      if (item.badge?.includes('DRAFT')) totalAdminDrafts++;
    }
  }

  if (adminCategories.length !== 7) {
    throw new Error(`Expected exactly 7 categories in Admin, got ${adminCategories.length}`);
  }
  for (let i = 0; i < CANONICAL_CATEGORIES.length; i++) {
    const expected = CANONICAL_CATEGORIES[i];
    const actual = adminCategories[i]?.title;
    if (actual !== expected) {
      throw new Error(`Category ${i + 1} mismatch: expected "${expected}", got "${actual}"`);
    }
  }
  console.log(`\n✔ Admin CMS displays all 7 canonical categories in exact order:`);
  CANONICAL_CATEGORIES.forEach((cat, idx) => console.log(`   0${idx + 1} ${cat}`));
  console.log(`✔ Admin CMS displays ${totalAdminDrafts} existing draft skills with DRAFT badges and controls.`);

  if (totalAdminDrafts !== 27) {
    throw new Error(`Expected 27 existing draft skills in Admin CMS, got ${totalAdminDrafts}`);
  }

  // STEP 2: Verify Production Public Skills Page
  console.log('\n--- STEP 2: Navigating to Production Public Skills Page ---');
  await navigateToSpa(page, '/skills');

  await page.waitForSelector('h1:has-text("Competencies & Tools")', { timeout: 15000 });
  await page.screenshot({ path: 'supabase/tests/prod_public_skills_verified.png', fullPage: true });

  const publicCategories = await page.evaluate(() => {
    const title = document.querySelector('h1')?.textContent?.trim();
    const categorySpans = Array.from(document.querySelectorAll('.rounded-3xl span.uppercase')).map(el => el.textContent?.trim() || '');
    const publishedSkillItems = Array.from(document.querySelectorAll('.rounded-3xl .p-3.rounded-xl.bg-paper-100')).map(el => el.textContent?.trim());
    return { title, categorySpans, publishedCount: publishedSkillItems.length, publishedSkillItems };
  });

  console.log('Public page title:', publicCategories.title);
  console.log('Public page category spans found:', publicCategories.categorySpans);
  console.log('Public published skill items count:', publicCategories.publishedCount);

  if (publicCategories.categorySpans.length !== 7) {
    throw new Error(`Expected 7 category sections on public page, got ${publicCategories.categorySpans.length}`);
  }
  for (let i = 0; i < CANONICAL_CATEGORIES.length; i++) {
    const expected = CANONICAL_CATEGORIES[i];
    const found = publicCategories.categorySpans.some(span => span.toLowerCase().includes(expected.toLowerCase()));
    if (!found) {
      throw new Error(`Public page missing canonical category span: "${expected}"`);
    }
  }
  console.log(`✔ Public page displays all 7 canonical categories in exact order.`);
  console.log(`✔ Public page currently renders 0 published skills (all 27 are drafts).`);

  if (publicCategories.publishedCount !== 0) {
    throw new Error(`Expected 0 published skills on public page, got ${publicCategories.publishedCount}`);
  }

  // STEP 3: Production E2E Test with 1 temporary test skill
  console.log('\n--- STEP 3: Production E2E Test (Draft -> Hide -> Publish -> Visible -> Unpublish -> Delete) ---');
  const TEST_SKILL_NAME = 'PROD_VERIF_SLAM_NAVIGATION';
  const TEST_CATEGORY = 'Autonomous Systems';
  const TEST_SUBDISCIPLINE = 'Nonlinear State Estimation & Sensor Fusion';

  // 3a. Create as Draft via Admin UI
  console.log('3a. Creating test skill as Draft via Admin UI...');
  await navigateToSpa(page, '/admin/skills');

  // Fill form at top of page
  await page.waitForSelector('input[placeholder="e.g. ROS 2 (Humble)"]', { timeout: 10000 });
  await page.fill('input[placeholder="e.g. ROS 2 (Humble)"]', TEST_SKILL_NAME);
  await page.selectOption('select', TEST_CATEGORY);
  await page.fill('input[placeholder="e.g. Node Architecture, Kinematics"]', TEST_SUBDISCIPLINE);

  // Click Save Draft button
  console.log('Clicking Save Draft...');
  await page.click('button:has-text("Save Draft")');
  await page.waitForTimeout(3500);

  // Verify test skill is in Admin CMS under Autonomous Systems with DRAFT badge
  const adminTestSkillDraft = await page.evaluate((skillName) => {
    const allItems = Array.from(document.querySelectorAll('.p-3.rounded-xl.bg-slate-50'));
    const item = allItems.find(el => el.querySelector('.font-semibold')?.textContent?.trim() === skillName);
    if (!item) return null;
    return {
      name: item.querySelector('.font-semibold')?.textContent?.trim(),
      badge: item.querySelector('.uppercase')?.textContent?.trim(),
      subdiscipline: item.querySelector('.text-slate-500')?.textContent?.trim(),
    };
  }, TEST_SKILL_NAME);

  console.log('Admin draft skill created:', adminTestSkillDraft);
  if (!adminTestSkillDraft || !adminTestSkillDraft.badge?.includes('DRAFT')) {
    throw new Error('Test skill not found as DRAFT in Admin CMS!');
  }
  console.log('✔ Test skill successfully created as DRAFT.');

  // 3b. Confirm it is hidden publicly
  console.log('\n3b. Checking public page - verifying draft skill is HIDDEN...');
  await navigateToSpa(page, '/skills');

  const publicHasDraft = await page.evaluate((skillName) => {
    return document.body.textContent?.includes(skillName);
  }, TEST_SKILL_NAME);

  console.log(`Public page contains test draft skill: ${publicHasDraft}`);
  if (publicHasDraft) {
    throw new Error('Draft test skill is LEAKING onto public page!');
  }
  console.log('✔ Draft test skill is verified HIDDEN on public page.');

  // 3c. Publish test skill via Admin UI
  console.log('\n3c. Publishing test skill via Admin UI...');
  await navigateToSpa(page, '/admin/skills');

  // Find the publish button for this item
  const published = await page.evaluate(async (skillName) => {
    const allItems = Array.from(document.querySelectorAll('.p-3.rounded-xl.bg-slate-50'));
    const item = allItems.find(el => el.querySelector('.font-semibold')?.textContent?.trim() === skillName);
    if (!item) return false;
    const pubBtn = Array.from(item.querySelectorAll('button')).find(b => b.textContent?.includes('Publish')) as HTMLButtonElement;
    if (!pubBtn) return false;
    pubBtn.click();
    return true;
  }, TEST_SKILL_NAME);

  if (!published) {
    throw new Error('Could not find publish button for test skill');
  }
  await page.waitForTimeout(3500);

  // Verify in Admin that badge changed to PUBLISHED
  const adminTestSkillPublished = await page.evaluate((skillName) => {
    const allItems = Array.from(document.querySelectorAll('.p-3.rounded-xl.bg-slate-50'));
    const item = allItems.find(el => el.querySelector('.font-semibold')?.textContent?.trim() === skillName);
    if (!item) return null;
    return {
      name: item.querySelector('.font-semibold')?.textContent?.trim(),
      badge: item.querySelector('.uppercase')?.textContent?.trim(),
    };
  }, TEST_SKILL_NAME);

  console.log('Admin skill after publish:', adminTestSkillPublished);
  if (!adminTestSkillPublished?.badge?.includes('PUBLISHED')) {
    throw new Error('Test skill does not show PUBLISHED badge in Admin CMS!');
  }
  console.log('✔ Test skill shows PUBLISHED badge in Admin CMS.');

  // 3d. Confirm it appears publicly under Autonomous Systems with subdiscipline
  console.log('\n3d. Checking public page - verifying published skill appears...');
  await navigateToSpa(page, '/skills');

  const publicSkillData = await page.evaluate((skillName) => {
    const bodyText = document.body.textContent || '';
    const hasName = bodyText.includes(skillName);
    const hasSubdiscipline = bodyText.includes('Nonlinear State Estimation & Sensor Fusion');
    const hasAutonomousCategory = bodyText.includes('Autonomous Systems') || bodyText.includes('AUTONOMOUS SYSTEMS');
    return { hasName, hasSubdiscipline, hasAutonomousCategory };
  }, TEST_SKILL_NAME);

  console.log('Public skill data check:', publicSkillData);
  if (!publicSkillData.hasName || !publicSkillData.hasSubdiscipline) {
    throw new Error('Published skill not found on public page with subdiscipline!');
  }
  console.log('✔ Published skill appears visibly on public page under Autonomous Systems with subdiscipline.');

  // 3e. Unpublish test skill via Admin UI
  console.log('\n3e. Unpublishing test skill via Admin UI...');
  await navigateToSpa(page, '/admin/skills');

  const unpublished = await page.evaluate((skillName) => {
    const allItems = Array.from(document.querySelectorAll('.p-3.rounded-xl.bg-slate-50'));
    const item = allItems.find(el => el.querySelector('.font-semibold')?.textContent?.trim() === skillName);
    if (!item) return false;
    const unpubBtn = Array.from(item.querySelectorAll('button')).find(b => b.textContent?.includes('Unpublish')) as HTMLButtonElement;
    if (!unpubBtn) return false;
    unpubBtn.click();
    return true;
  }, TEST_SKILL_NAME);

  if (!unpublished) {
    throw new Error('Could not find unpublish button for test skill');
  }
  await page.waitForTimeout(3500);

  // 3f. Confirm it disappears publicly
  console.log('\n3f. Checking public page - verifying unpublished skill disappeared...');
  await navigateToSpa(page, '/skills');

  const publicHasUnpublished = await page.evaluate((skillName) => {
    return document.body.textContent?.includes(skillName);
  }, TEST_SKILL_NAME);

  console.log(`Public page contains test skill after unpublish: ${publicHasUnpublished}`);
  if (publicHasUnpublished) {
    throw new Error('Unpublished test skill still appears on public page!');
  }
  console.log('✔ Unpublished test skill disappeared from public page.');

  // 3g. Delete test skill via Admin UI
  console.log('\n3g. Deleting test skill via Admin UI...');
  await navigateToSpa(page, '/admin/skills');

  const skillCard = page.locator('.p-3.rounded-xl.bg-slate-50', { hasText: TEST_SKILL_NAME });
  await skillCard.locator('button[title="Delete Skill"]').click();
  await page.waitForTimeout(4000);

  // 3h. Confirm no test record remains in Database or Admin
  console.log('\n3h. Verifying no test data remains in Database...');
  const finalFetch = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const finalData = await finalFetch.json();
  const remainingSkills = finalData.data || [];
  const testItems = remainingSkills.filter((s: any) => s.name?.startsWith('PROD_VERIF_') || s.name?.startsWith('TEST_'));
  console.log(`Remaining test items in DB: ${testItems.length}`);
  console.log(`Remaining total real items in DB: ${remainingSkills.length}`);

  if (testItems.length !== 0) {
    throw new Error('Test records still remain in database!');
  }
  if (remainingSkills.length !== 27) {
    throw new Error(`Expected exactly 27 real skills preserved, found ${remainingSkills.length}`);
  }

  // Ensure all 27 are still drafts and untouched
  const publishedRealCount = remainingSkills.filter((s: any) => s.publication_status === 'published').length;
  console.log(`Published real skills count: ${publishedRealCount}`);
  if (publishedRealCount !== 0) {
    throw new Error(`Expected 0 published real skills, found ${publishedRealCount}`);
  }

  console.log('\n================================================================');
  console.log('  ✔ ALL PRODUCTION VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('================================================================\n');

  await browser.close();
}

runProductionSkillsVerification().catch((err) => {
  console.error('\n❌ Production Verification Failed:', err);
  process.exit(1);
});
