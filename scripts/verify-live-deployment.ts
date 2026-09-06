import https from 'https';

async function fetchUrl(path: string) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'tanishk756.github.io',
      path: path,
      headers: { 'User-Agent': 'Tanishk-Live-Verification' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, statusCode: res.statusCode, length: data.length, body: data.substring(0, 150) });
      });
    }).on('error', (e) => resolve({ path, error: e.message }));
  });
}

async function run() {
  const testPaths = [
    '/',
    '/tanishksinghal.github.io/',
    '/tanishksinghal.github.io/about',
    '/tanishksinghal.github.io/projects',
    '/tanishksinghal.github.io/experience',
    '/tanishksinghal.github.io/research',
    '/tanishksinghal.github.io/publications',
    '/tanishksinghal.github.io/skills',
    '/tanishksinghal.github.io/blog',
    '/tanishksinghal.github.io/contact'
  ];

  for (const p of testPaths) {
    const res: any = await fetchUrl(p);
    console.log(`Path: ${res.path.padEnd(40)} -> HTTP ${res.statusCode} (${res.length} bytes)`);
  }
}

run().catch(console.error);
