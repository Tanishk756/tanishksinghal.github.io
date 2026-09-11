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

async function debugPage() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext();

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

  page.on('console', msg => console.log('DEBUG CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('DEBUG PAGEERROR:', err.message));

  console.log('Navigating to https://tanishksinghal.in/?/admin/skills ...');
  await page.goto('https://tanishksinghal.in/?/admin/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('Current URL after load:', currentUrl);
  const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body text snippet:\n', bodySnippet);

  await page.screenshot({ path: 'supabase/tests/debug_admin_skills.png', fullPage: true });

  await browser.close();
}

debugPage().catch(console.error);
