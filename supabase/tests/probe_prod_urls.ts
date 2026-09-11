async function probeUrls() {
  const urls = [
    'https://tanishksinghal.github.io/',
    'https://tanishksinghal.github.io/skills',
    'https://tanishksinghal.github.io/admin/skills',
    'https://tanishk756.github.io/tanishksinghal.github.io/',
    'https://tanishk756.github.io/tanishksinghal.github.io/skills',
    'https://tanishk756.github.io/tanishksinghal.github.io/admin/skills',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      const text = await res.text();
      console.log(`URL: ${url} -> Status: ${res.status} | Final URL: ${res.url} | Body length: ${text.length}`);
      // Check for bundle JS scripts in the HTML
      const scriptMatches = [...text.matchAll(/src="([^"]*\.js)"/g)];
      console.log(`  -> Script tags found:`, scriptMatches.map(m => m[1]));
    } catch (e: any) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}

probeUrls();
