import { chromium } from 'playwright-core';

const PROD_BASE_URL = 'https://tanishksinghal.in';
const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';

async function verifyNoDateOnPublicResearch() {
  console.log('================================================================');
  console.log('  VERIFYING PUBLIC RESEARCH PAGE & DATE INTEGRITY');
  console.log('  Base URL: https://tanishksinghal.in');
  console.log('================================================================\n');

  // 1. Direct API / Network Verification
  console.log('--- STEP 1: Inspecting live Supabase public-content API response ---');
  const apiRes = await fetch(`${SUPABASE_URL}/functions/v1/public-content?type=research`);
  const apiJson = await apiRes.json();
  console.log('public-content API status:', apiRes.status);
  console.log('public-content API returned items count:', Array.isArray(apiJson.data) ? apiJson.data.length : (apiJson.data ? 1 : 0));
  console.log('API raw data:', JSON.stringify(apiJson.data, null, 2));

  // 2. Real Browser DOM Verification
  console.log('\n--- STEP 2: Launching real Chrome browser to inspect production DOM ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    });

    const spaUrl = `${PROD_BASE_URL}/?/research`;
    console.log(`Navigating to: ${spaUrl}`);
    await page.goto(spaUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const bodyText = await page.textContent('body');
    console.log('\n--- BROWSER PAGE TEXT CONTENT ---');
    console.log(bodyText);

    // Check for any research cards rendered
    const researchCards = await page.$$eval('.rounded-3xl.bg-white.border', (cards) => {
      return cards.map(c => {
        const title = c.querySelector('h2')?.textContent?.trim() || '';
        const metaSpan = c.querySelector('span.text-xs.font-mono.text-stone-500')?.textContent?.trim() || '';
        return { title, metaSpan };
      });
    });

    console.log('\n--- RENDERED RESEARCH ITEMS IN DOM ---');
    console.log(JSON.stringify(researchCards, null, 2));

    for (const card of researchCards) {
      console.log(`Checking item "${card.title}": metadata is "${card.metaSpan}"`);
      if (card.metaSpan.includes('2023') || card.metaSpan.includes('Present') || card.metaSpan.includes('·')) {
        throw new Error(`CRITICAL BUG: Fabricated date found in metadata for "${card.title}": "${card.metaSpan}"`);
      }
    }

    if (bodyText?.includes('2023 — Present') || bodyText?.includes('2023 – Present') || bodyText?.includes('2023 - Present')) {
      throw new Error(`CRITICAL BUG: "2023 – Present" is still rendered somewhere on the page!`);
    }

    console.log('\n✔ Verified: ZERO fabricated dates rendered in the production DOM.');
    console.log('✔ All Research Programs render clean domain metadata without invented dates.');

    console.log('\n================================================================');
    console.log('  DATE INTEGRITY VERIFICATION PASSED WITH 100% SUCCESS!         ');
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }
}

verifyNoDateOnPublicResearch().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
