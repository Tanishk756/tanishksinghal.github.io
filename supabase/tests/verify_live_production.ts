import { chromium } from 'playwright-core';
import path from 'node:path';

async function verifyLiveProduction() {
  console.log('🌐 Launching browser to verify LIVE production: https://tanishksinghal.in/ ...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--ignore-gpu-blocklist',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const viewports = [
    { name: '1440x900', width: 1440, height: 900, dpr: 1 },
    { name: '1280x900', width: 1280, height: 900, dpr: 1 },
    { name: '768x1024', width: 768, height: 1024, dpr: 1 },
    { name: '375x812', width: 375, height: 812, dpr: 2 },
  ];

  const consoleErrors: string[] = [];
  const artifactsDir = 'C:\\Users\\droni\\.gemini\\antigravity-ide\\brain\\863be9c3-dc54-40c1-8b1c-3c558f243d98';

  const zoneMilestones = [
    { zone: '00_lab', scrollRatio: 0.0 },
    { zone: '01_robotics', scrollRatio: 0.22 },
    { zone: '02_autonomy', scrollRatio: 0.38 },
    { zone: '03_aerospace', scrollRatio: 0.55 },
    { zone: '04_research', scrollRatio: 0.70 },
    { zone: '05_projects', scrollRatio: 0.85 },
    { zone: '06_contact', scrollRatio: 0.98 },
  ];

  for (const vp of viewports) {
    console.log(`\n==================================================`);
    console.log(`📸 Testing LIVE Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    console.log(`==================================================`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${vp.name}] ${msg.text()}`);
      }
    });

    console.log('Navigating to https://tanishksinghal.in/ ...');
    await page.goto('https://tanishksinghal.in/', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    for (const milestone of zoneMilestones) {
      if (milestone.scrollRatio > 0) {
        await page.evaluate((ratio) => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: maxScroll * ratio, behavior: 'instant' as ScrollBehavior });
        }, milestone.scrollRatio);
        await page.waitForTimeout(1000);
      }

      const screenshotName = `live_${vp.name}_${milestone.zone}.png`;
      const screenshotPath = path.join(artifactsDir, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot: ${screenshotName}`);
    }

    await context.close();
  }

  await browser.close();

  console.log('\n==================================================');
  console.log(`Live Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error(consoleErrors);
  }
  console.log('==================================================');
}

verifyLiveProduction().catch((err) => {
  console.error('Live verification failed:', err);
  process.exit(1);
});
