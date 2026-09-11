import { chromium } from 'playwright-core';

async function verifyLiveArticleTypography() {
  console.log('================================================================');
  console.log('  STARTING LIVE ARTICLE TYPOGRAPHY & MD RENDERER E2E VERIFICATION');
  console.log('================================================================');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser PageError]: ${err.message}`));

  const navigateToSpa = async (targetPath: string) => {
    const directUrl = `https://tanishksinghal.in/?${targetPath}`;
    console.log(`Navigating to SPA URL: ${directUrl}`);
    await page.goto(directUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
  };

  try {
    // 1. Navigate to /blog
    console.log('\n--- STEP 1: Navigating to /blog ---');
    await navigateToSpa('/blog');

    // 2. Find blog post links
    const articleLinks = await page.$$eval('a[href*="/blog/"]', els => els.map(a => a.getAttribute('href')));
    console.log(`Found blog article links:`, articleLinks);

    // Prefer apex-track or first available post
    let targetSlug = 'ros2-kinematics-closed-loop';
    for (const link of articleLinks) {
      if (link && link.includes('apex-track')) {
        const parts = link.split('/blog/');
        if (parts[1]) targetSlug = parts[1];
        break;
      } else if (link && link.startsWith('/blog/') && link !== '/blog') {
        const parts = link.split('/blog/');
        if (parts[1]) targetSlug = parts[1];
      }
    }

    console.log(`Target article slug: ${targetSlug}`);

    // 3. Navigate to article detail
    console.log(`\n--- STEP 2: Navigating to /blog/${targetSlug} on Desktop ---`);
    await navigateToSpa(`/blog/${targetSlug}`);

    // 4. Verify DOM elements inside .article-content
    console.log('\n--- STEP 3: Inspecting DOM elements inside .article-content ---');
    await page.waitForSelector('.article-content', { timeout: 15000 });

    const domReport = await page.evaluate(() => {
      const articleEl = document.querySelector('.article-content');
      if (!articleEl) return { found: false };

      const h1s = Array.from(articleEl.querySelectorAll('h1')).map(el => el.textContent?.trim());
      const h2s = Array.from(articleEl.querySelectorAll('h2')).map(el => el.textContent?.trim());
      const h3s = Array.from(articleEl.querySelectorAll('h3')).map(el => el.textContent?.trim());
      const strongs = Array.from(articleEl.querySelectorAll('strong, b')).map(el => el.textContent?.trim());
      const ems = Array.from(articleEl.querySelectorAll('em, i')).map(el => el.textContent?.trim());
      const uls = articleEl.querySelectorAll('ul').length;
      const ols = articleEl.querySelectorAll('ol').length;
      const lis = articleEl.querySelectorAll('li').length;
      const blockquotes = Array.from(articleEl.querySelectorAll('blockquote')).map(el => el.textContent?.trim());
      const pres = articleEl.querySelectorAll('pre').length;
      const codes = articleEl.querySelectorAll('code').length;
      const hrs = articleEl.querySelectorAll('hr').length;
      const ps = articleEl.querySelectorAll('p').length;

      // Check for raw markdown syntax leakage
      const rawText = articleEl.textContent || '';
      const hasRawHeadingLeak = /(?:^|\n)#{1,6}\s+[A-Za-z0-9]/.test(rawText);
      const hasRawBoldLeak = /\*\*[A-Za-z0-9\s]+\*\*/.test(rawText);

      return {
        found: true,
        h1Count: h1s.length,
        h1s,
        h2Count: h2s.length,
        h2s,
        h3Count: h3s.length,
        h3s,
        strongCount: strongs.length,
        strongs,
        emCount: ems.length,
        ems,
        uls,
        ols,
        lis,
        blockquotesCount: blockquotes.length,
        blockquotes,
        pres,
        codes,
        hrs,
        ps,
        hasRawHeadingLeak,
        hasRawBoldLeak
      };
    });

    console.log('DOM Report:', JSON.stringify(domReport, null, 2));

    if (!domReport.found) {
      throw new Error('.article-content container was not found on the page');
    }

    if (domReport.hasRawHeadingLeak) {
      throw new Error('Raw markdown heading syntax (#) leaked into rendered text!');
    }

    if (domReport.hasRawBoldLeak) {
      throw new Error('Raw markdown bold syntax (**) leaked into rendered text!');
    }

    // 5. Responsive Verification (Tablet & Mobile)
    console.log('\n--- STEP 4: Verifying Responsive Rendering on Tablet (768px) ---');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const tabletPreOverflow = await page.evaluate(() => {
      const pre = document.querySelector('.article-content pre');
      if (!pre) return true;
      const style = window.getComputedStyle(pre);
      return style.overflowX === 'auto' || style.overflow === 'auto';
    });
    console.log(`Tablet Code Block Horizontal Scroll Enabled: ${tabletPreOverflow}`);

    console.log('\n--- STEP 5: Verifying Responsive Rendering on Mobile (375px) ---');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    const mobilePreOverflow = await page.evaluate(() => {
      const pre = document.querySelector('.article-content pre');
      if (!pre) return true;
      const style = window.getComputedStyle(pre);
      return style.overflowX === 'auto' || style.overflow === 'auto';
    });
    console.log(`Mobile Code Block Horizontal Scroll Enabled: ${mobilePreOverflow}`);

    // Take screenshot on mobile and desktop
    await page.screenshot({ path: 'supabase/tests/prod_blog_article_mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'supabase/tests/prod_blog_article_desktop.png', fullPage: true });

    console.log('\n================================================================');
    console.log('  LIVE ARTICLE TYPOGRAPHY & MD RENDERER E2E VERIFICATION PASSED');
    console.log('================================================================');

  } finally {
    await browser.close();
  }
}

verifyLiveArticleTypography().catch(err => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});
