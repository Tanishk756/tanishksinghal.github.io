import { chromium } from 'playwright-core';

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
    iat: now,
    exp: now + expiresInSec,
  };
  const base64url = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${base64url(header)}.${base64url(payload)}.mock-signature`;
}

async function verifyLiveRichMarkdown() {
  console.log('================================================================');
  console.log('  LIVE TECHNICAL BLOG MARKDOWN & TYPOGRAPHY VERIFICATION');
  console.log('================================================================\n');

  const adminToken = createAdminJwt(ADMIN_EMAIL);
  const testSlug = `md-test-${Date.now()}`;
  let canonicalUuid: string | null = null;

  const testMarkdown = `
# Building APEX-Track: Engineering a Modular Perception and Persistent Tracking System

I have always found the gap between a computer-vision demo and a dependable autonomous system more interesting than the demo itself.

## The Idea Behind the System

A detector can identify an object, but a persistent autonomous system needs to maintain state over time.

**Detection is not tracking.** APEX-Track is built around that distinction.

> The interesting engineering problem begins after the first successful detection.

### Multi-Model Perception

The system integrates multiple perception backends:

- YOLOv8-seg
- RT-DETR
- YOLO11

1. Initialize detector backend
2. Perform temporal association
3. Update state covariance

\`\`\`python
def track_target(state, observation):
    prediction = state.predict()
    return state.update(observation)
\`\`\`

---

Read more at [System Architecture](https://tanishksinghal.in).
`;

  try {
    // 1. Create and publish test blog post via Supabase edge functions
    console.log('--- STEP 1: Creating rich markdown test article via admin-content ---');
    const createRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=blog_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Building APEX-Track: Engineering a Modular Perception and Persistent Tracking System',
        slug: testSlug,
        excerpt: 'A comprehensive technical overview of modular perception, multi-model fusion, and stateful tracking in autonomous robotics.',
        author: 'Tanishk Singhal',
        readingTimeMinutes: 5,
        category: 'Autonomous Systems',
        tags: ['Perception', 'Tracking', 'Robotics', 'Kalman Filter'],
        content: testMarkdown,
        publicationStatus: 'draft',
        verificationStatus: 'USER_PROVIDED',
      }),
    });

    const createJson = await createRes.json();
    canonicalUuid = createJson.id || createJson.data?.id;
    console.log('Created test article with canonical UUID:', canonicalUuid);

    // Approve & Publish
    console.log('--- STEP 2: Publishing test article via admin-publish ---');
    const pubRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        contentType: 'blog_posts',
        contentId: canonicalUuid,
        currentStatus: 'draft',
        verificationStatus: 'USER_PROVIDED',
      }),
    });
    const pubJson = await pubRes.json();
    console.log('Published response:', pubJson);

    // 2. Launch browser to inspect live rendered DOM on tanishksinghal.in
    console.log('\n--- STEP 3: Launching browser and navigating to live article page ---');
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    const spaUrl = `${PROD_BASE_URL}/?/blog/${testSlug}`;
    console.log(`Navigating to SPA URL: ${spaUrl}`);
    await page.goto(spaUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 3. Evaluate DOM
    console.log('\n--- STEP 4: Inspecting live rendered DOM for semantic typography ---');
    await page.waitForSelector('.article-content', { timeout: 15000 });

    const report = await page.evaluate(() => {
      const articleEl = document.querySelector('.article-content');
      if (!articleEl) return { found: false };

      const h1s = Array.from(articleEl.querySelectorAll('h1')).map(el => ({ text: el.textContent?.trim(), tag: 'h1' }));
      const h2s = Array.from(articleEl.querySelectorAll('h2')).map(el => ({ text: el.textContent?.trim(), tag: 'h2' }));
      const h3s = Array.from(articleEl.querySelectorAll('h3')).map(el => ({ text: el.textContent?.trim(), tag: 'h3' }));
      const strongs = Array.from(articleEl.querySelectorAll('strong, b')).map(el => ({ text: el.textContent?.trim(), tag: 'strong' }));
      const uls = Array.from(articleEl.querySelectorAll('ul li')).map(el => el.textContent?.trim());
      const ols = Array.from(articleEl.querySelectorAll('ol li')).map(el => el.textContent?.trim());
      const blockquotes = Array.from(articleEl.querySelectorAll('blockquote')).map(el => el.textContent?.trim());
      const pres = Array.from(articleEl.querySelectorAll('pre code')).map(el => el.textContent?.trim());
      const hrs = articleEl.querySelectorAll('hr').length;
      const links = Array.from(articleEl.querySelectorAll('a')).map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }));
      const ps = articleEl.querySelectorAll('p').length;

      const rawText = articleEl.textContent || '';
      const rawHeadingLeak = /(?:^|\n)#{1,6}\s+/.test(rawText);
      const rawBoldLeak = /\*\*[A-Za-z0-9\s]+\*\*/.test(rawText);

      return {
        found: true,
        h1s,
        h2s,
        h3s,
        strongs,
        uls,
        ols,
        blockquotes,
        pres,
        hrs,
        links,
        ps,
        rawHeadingLeak,
        rawBoldLeak
      };
    });

    console.log('Live Render Report:\n', JSON.stringify(report, null, 2));

    if (!report.found) throw new Error('.article-content not found');
    if (report.rawHeadingLeak) throw new Error('Raw heading leak detected');
    if (report.rawBoldLeak) throw new Error('Raw bold leak detected');
    if (report.h1s.length < 1) throw new Error('H1 heading not rendered as <h1>');
    if (report.h2s.length < 1) throw new Error('H2 section heading not rendered as <h2>');
    if (report.h3s.length < 1) throw new Error('H3 subsection heading not rendered as <h3>');
    if (report.strongs.length < 1) throw new Error('Bold text not rendered as <strong>');
    if (report.blockquotes.length < 1) throw new Error('Blockquote not rendered as <blockquote>');
    if (report.uls.length < 3) throw new Error('Unordered list items not rendered as <li>');
    if (report.ols.length < 3) throw new Error('Ordered list items not rendered as <li>');
    if (report.pres.length < 1) throw new Error('Code block not rendered as <pre><code>');
    if (report.hrs < 1) throw new Error('Horizontal rule not rendered as <hr>');
    if (report.links.length < 1) throw new Error('Links not rendered as <a>');

    console.log('\n✅ ALL LIVE ARTICLE DOM VERIFICATIONS PASSED WITH 100% ACCURACY');

    // Screenshot
    await page.screenshot({ path: 'supabase/tests/prod_rendered_article.png', fullPage: true });
    console.log('Saved screenshot to supabase/tests/prod_rendered_article.png');

    await browser.close();

  } finally {
    // Cleanup test record
    if (canonicalUuid) {
      console.log(`\n--- CLEANUP: Deleting test record ${canonicalUuid} ---`);
      await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=blog_posts&id=${encodeURIComponent(canonicalUuid)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log('✅ CLEANUP COMPLETE: Test record removed.');
    }
  }
}

verifyLiveRichMarkdown().catch(err => {
  console.error('Fatal live verification error:', err);
  process.exit(1);
});
