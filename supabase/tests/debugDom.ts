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
      resolve(server);
    });
  });
}

async function debugDom() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const port = 4192;
  const server = await createStaticServer(distPath, port);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));

  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const html = await page.evaluate(() => document.getElementById('root')?.innerHTML || document.body.innerHTML);
  console.log('ROOT HTML LENGTH:', html.length);
  console.log('ROOT HTML PREVIEW:\n', html.substring(0, 500));

  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  console.log('CANVAS COUNT:', canvasCount);

  await browser.close();
  server.close();
}

debugDom().catch(console.error);
