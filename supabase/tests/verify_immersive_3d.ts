import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

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

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise<http.Server>((resolve) => {
    server.listen(port, () => {
      console.log(`Local static preview server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

const mockPublicContent = {
  profile: {
    id: 'prof-1',
    fullName: 'Tanishk Singhal',
    displayName: 'Tanishk Singhal',
    headline: 'Robotics researcher and autonomous systems engineer focusing on closed-loop kinematics and SLAM.',
    publication_status: 'published',
    verification_status: 'USER_PROVIDED',
  },
  projects: [
    {
      id: 'p-1',
      slug: 'autonomous-mobile-robot-ros-2',
      title: 'Autonomous Mobile Robot — ROS 2',
      tagline: 'Differential drive autonomous navigation in GPS-denied indoor spaces.',
      category: 'autonomy',
      subcategories: ['ROS 2', 'Nav2', 'SLAM'],
      status: 'completed',
      featured: true,
      startDate: '2024-01-01',
    },
    {
      id: 'p-2',
      slug: 'apex-track',
      title: 'APEX-Track — Autonomous Perception Platform',
      tagline: 'Multi-modal perception and tracking for counter-UAS platforms.',
      category: 'ai-ml',
      subcategories: ['YOLOv8', 'DeepSORT', 'Kalman Filter'],
      status: 'completed',
      featured: true,
      startDate: '2024-03-01',
    },
    {
      id: 'p-3',
      slug: 'aeroguard',
      title: 'AeroGuard — Defensive Counter-UAS Platform',
      tagline: 'Airborne interceptor kinematics and autonomy stack.',
      category: 'uav-aerospace',
      subcategories: ['PX4', 'UAV', 'Trajectory Optimization'],
      status: 'completed',
      featured: true,
      startDate: '2024-06-01',
    },
    {
      id: 'p-4',
      slug: 'openrobo',
      title: 'OpenROBO — Open-Source Modular Manipulator',
      tagline: '6-DOF serial kinematic articulated arm platform.',
      category: 'robotics',
      subcategories: ['ROS 2', 'MoveIt 2', 'Kinematics'],
      status: 'completed',
      featured: true,
      startDate: '2024-08-01',
    },
    {
      id: 'p-5',
      slug: 'ros2-turtle-autonomous-navigation',
      title: 'ROS 2 Turtle Autonomous Navigation',
      tagline: 'Simulated multi-agent coordination and path planning.',
      category: 'autonomy',
      subcategories: ['ROS 2', 'Gazebo', 'Nav2'],
      status: 'completed',
      featured: false,
      startDate: '2023-11-01',
    },
    {
      id: 'p-6',
      slug: 'physical-robotics-vision-system',
      title: 'Physical Robotics Vision System',
      tagline: 'Stereo vision depth pipeline with edge FPGA hardware acceleration.',
      category: 'ai-ml',
      subcategories: ['Computer Vision', 'Stereo Depth', 'CUDA'],
      status: 'completed',
      featured: false,
      startDate: '2024-02-01',
    },
  ],
  research: [],
  publications: [],
  patents: [],
  experience: [],
  skills: [],
  achievements: [],
  certifications: [],
  organizations: [],
  blog_posts: [],
};

async function verifyImmersive3D() {
  console.log('🚀 Starting Immersive 3D World E2E verification across viewports...');

  const distPath = path.resolve(process.cwd(), 'dist');
  const port = 4181;
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

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, dpr: 1 },
    { name: 'tablet', width: 768, height: 1024, dpr: 1 },
    { name: 'mobile', width: 375, height: 812, dpr: 2 },
  ];

  const consoleErrors: string[] = [];
  const artifactsDir = 'C:\\Users\\droni\\.gemini\\antigravity-ide\\brain\\863be9c3-dc54-40c1-8b1c-3c558f243d98';

  for (const vp of viewports) {
    console.log(`\n📸 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
    });
    const page = await context.newPage();

    // Intercept Supabase Edge Functions for local test runner
    await page.route('**/functions/v1/public-content*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, data: mockPublicContent }),
      });
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${vp.name}] ${msg.text()}`);
      }
    });

    await page.goto(`http://localhost:${port}/tanishksinghal.github.io/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Capture Hero Opening Viewport
    const heroDest = path.join(artifactsDir, `${vp.name}_hero_immersive.png`);
    await page.screenshot({ path: heroDest, fullPage: false });
    console.log(`Saved hero screenshot: ${heroDest}`);

    // Scroll to Robotics / Autonomy zone (progress ~ 0.28)
    await page.evaluate(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: maxScroll * 0.28, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(1500);

    const midDest = path.join(artifactsDir, `${vp.name}_robotics_immersive.png`);
    await page.screenshot({ path: midDest, fullPage: false });
    console.log(`Saved mid zone screenshot: ${midDest}`);

    // Scroll to Projects zone (progress ~ 0.85)
    await page.evaluate(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: maxScroll * 0.85, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(1500);

    const projectsDest = path.join(artifactsDir, `${vp.name}_projects_immersive.png`);
    await page.screenshot({ path: projectsDest, fullPage: false });
    console.log(`Saved projects zone screenshot: ${projectsDest}`);

    await context.close();
  }

  await browser.close();
  server.close();

  console.log('\n==================================================');
  console.log(`Console Errors Caught: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error(consoleErrors);
  }
  console.log('==================================================');
}

verifyImmersive3D().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
