async function checkProdDeployment() {
  const url = 'https://tanishksinghal.github.io';
  console.log(`Checking production HTML from ${url}...`);
  const res = await fetch(url, { cache: 'no-cache' });
  const html = await res.text();
  console.log('HTTP Status:', res.status);
  
  // Find script tags
  const matches = html.match(/src="([^"]+)"/g);
  console.log('Script sources found on production:', matches);
}

checkProdDeployment().catch(console.error);
