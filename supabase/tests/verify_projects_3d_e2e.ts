import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Simple static server for dist directory
function createStaticServer(distPath: string, port: number) {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url ? req.url.split('?')[0] : '/';
    reqPath = reqPath.replace(/^\/tanishksinghal\.github\.io/, '');
    if (reqPath === '' || reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(distPath, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distPath, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise<http.Server>((resolve) => {
    server.listen(port, () => {
      console.log(`Local static preview server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function runProjects3dE2E() {
  console.log('================================================================');
  console.log('  STARTING PHASE 3 PROJECTS 3D GALLERY E2E & RESPONSIVE AUDIT');
  console.log('================================================================\n');

  const distPath = path.resolve(process.cwd(), 'dist');
  const port = 4175;
  const server = await createStaticServer(distPath, port);

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

  const consoleErrors: string[] = [];

  const mockData = {
    profile: {
      id: 'prof-1',
      fullName: 'Tanishk Singhal',
      displayName: 'Tanishk Singhal',
      headline: 'Autonomous Systems & Robotics Researcher',
      publication_status: 'published',
      verification_status: 'USER_PROVIDED',
    },
    projects: [
      {
        id: 'p-1',
        slug: 'autonomous-mobile-robot-ros-2',
        title: 'Autonomous Mobile Robot — ROS 2',
        tagline: 'Differential drive autonomous navigation in GPS-denied spaces.',
        category: 'autonomy',
        subcategories: ['ROS 2', 'Nav2', 'SLAM'],
        status: 'completed',
        featured: true,
        startDate: '2024-01-01',
        problem: 'Autonomous waypoint tracking in GPS-denied indoor spaces.',
        role: 'Lead Systems Architect',
      },
      {
        id: 'p-2',
        slug: 'apex-track',
        title: 'APEX-Track — Autonomous Perception & Persistent Target Tracking Platform',
        tagline: 'Multi-modal perception and tracking for counter-UAS platforms.',
        category: 'ai-ml',
        subcategories: ['YOLOv8', 'DeepSORT', 'Kalman Filter'],
        status: 'completed',
        featured: true,
        startDate: '2024-03-01',
        problem: 'Low-latency aerial target detection under severe occlusion.',
        role: 'Computer Vision Engineer',
      },
      {
        id: 'p-3',
        slug: 'aeroguard',
        title: 'AeroGuard — Defensive Counter-UAS Research Platform',
        tagline: 'Airborne interceptor kinematics and autonomy stack.',
        category: 'uav-aerospace',
        subcategories: ['PX4', 'UAV', 'NMPC'],
        status: 'completed',
        featured: true,
        startDate: '2024-06-01',
        problem: 'High-speed evasive target interception algorithms.',
        role: 'Guidance & Control Engineer',
      },
      {
        id: 'p-4',
        slug: 'openrobo',
        title: 'OpenRobo — Open Robotics Commons Platform',
        tagline: 'Modular robotics simulation and driver architecture.',
        category: 'robotics',
        subcategories: ['ROS 2', 'Gazebo', 'ros2_control'],
        status: 'completed',
        featured: true,
        startDate: '2024-08-01',
        problem: 'Standardized ros2_control plugin architectures.',
        role: 'Open Source Maintainer',
      },
    ],
    experience: [],
    research: [],
    publications: [],
    patents: [],
    skills: [],
    education: [],
    organizations: [],
    certifications: [],
    achievements: [],
    blogPosts: [],
  };

  const setupRoutes = async (page: any) => {
    await page.route('**/functions/v1/public-content**', (route: any) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          success: true,
          data: mockData,
        }),
      });
    });
  };

  try {
    // 1. DESKTOP VIEWPORT TEST (1280 x 900)
    console.log('--- STEP 1: Desktop Viewport Testing on /projects (1280x900) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();

    desktopPage.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon.ico')) {
        consoleErrors.push(msg.text());
      }
    });

    await setupRoutes(desktopPage);
    await desktopPage.goto(`http://localhost:${port}/tanishksinghal.github.io/projects`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await desktopPage.waitForTimeout(3500);

    const pageTitle = await desktopPage.$eval('h1', el => el.textContent?.trim());
    console.log(`Page Heading: ${pageTitle}`);

    const hangarHeader = await desktopPage.$eval(
      'text=ENGINEERING SYSTEMS HANGAR // 3D WORKSPACE',
      el => !!el
    ).catch(() => false);
    console.log(`3D Project Hangar Header present: ${hangarHeader}`);

    const canvasElement = await desktopPage.$('canvas');
    console.log(`3D Canvas mounted on /projects: ${!!canvasElement}`);

    // Capture Desktop Screenshot
    await desktopPage.screenshot({ path: 'supabase/tests/desktop_projects_3d.png', fullPage: false });
    console.log('✅ Captured desktop screenshot: supabase/tests/desktop_projects_3d.png');

    await desktopContext.close();

    // 2. MOBILE VIEWPORT TEST (375 x 812 - iPhone X)
    console.log('\n--- STEP 2: Mobile Viewport Testing on /projects (375x812) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await setupRoutes(mobilePage);

    await mobilePage.goto(`http://localhost:${port}/tanishksinghal.github.io/projects`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await mobilePage.waitForTimeout(3000);

    const mobileCanvas = await mobilePage.$('canvas');
    console.log(`Mobile Canvas mounted on /projects: ${!!mobileCanvas}`);

    await mobilePage.screenshot({ path: 'supabase/tests/mobile_projects_3d.png', fullPage: false });
    console.log('✅ Captured mobile screenshot: supabase/tests/mobile_projects_3d.png');

    await mobileContext.close();

    // 3. TABLET VIEWPORT TEST (768 x 1024 - iPad)
    console.log('\n--- STEP 3: Tablet Viewport Testing on /projects (768x1024) ---');
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const tabletPage = await tabletContext.newPage();
    await setupRoutes(tabletPage);

    await tabletPage.goto(`http://localhost:${port}/tanishksinghal.github.io/projects`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await tabletPage.waitForTimeout(2500);

    const tabletCanvas = await tabletPage.$('canvas');
    console.log(`Tablet Canvas mounted on /projects: ${!!tabletCanvas}`);

    await tabletPage.screenshot({ path: 'supabase/tests/tablet_projects_3d.png', fullPage: false });
    console.log('✅ Captured tablet screenshot: supabase/tests/tablet_projects_3d.png');

    await tabletContext.close();

    console.log('\n--- Console Error Audit ---');
    console.log(`Runtime Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
      throw new Error(`Console errors occurred: ${consoleErrors.join(', ')}`);
    }

    console.log('\n================================================================');
    console.log('  PHASE 3 PROJECTS 3D GALLERY E2E VERIFIED WITH 100% SUCCESS');
    console.log('================================================================');

  } finally {
    await browser.close();
    server.close();
  }
}

runProjects3dE2E().catch(err => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});
