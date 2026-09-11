async function main() {
  const ghUrl = 'https://api.github.com/repos/Tanishk756/tanishksinghal.github.io/actions/runs?per_page=5';
  console.log('Fetching GitHub Actions runs...');
  try {
    const res = await fetch(ghUrl, { headers: { 'User-Agent': 'Node' } });
    const data = await res.json();
    console.log('GitHub Runs:');
    for (const r of (data.workflow_runs || [])) {
      console.log(`- ID: ${r.id} | SHA: ${r.head_sha} | Status: ${r.status} | Conclusion: ${r.conclusion} | Name: ${r.name} | Created: ${r.created_at}`);
    }
  } catch (e: any) {
    console.error('Error fetching GH runs:', e.message);
  }

  console.log('\nFetching production domain tanishksinghal.in index...');
  try {
    const res = await fetch('https://tanishksinghal.in/');
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('HTML size:', html.length);
    const scripts = [...html.matchAll(/src="([^"]*\.js)"/g)].map(m => m[1]);
    console.log('Scripts:', scripts);
    for (const s of scripts) {
      const fullUrl = s.startsWith('http') ? s : `https://tanishksinghal.in${s.startsWith('/') ? '' : '/'}${s}`;
      console.log('Fetching script:', fullUrl);
      const sRes = await fetch(fullUrl);
      const js = await sRes.text();
      console.log('  Size:', js.length);
      console.log('  Contains "Space Systems & UAV":', js.includes('Space Systems & UAV'));
      console.log('  Contains "Autonomous Systems":', js.includes('Autonomous Systems'));
      console.log('  Contains "06 Space Systems & UAV":', js.includes('06 Space Systems & UAV') || js.includes('06 // Space Systems & UAV'));
      console.log('  Contains "02 Autonomous Systems":', js.includes('02 Autonomous Systems') || js.includes('02 // Autonomous Systems'));
      console.log('  Contains "[DRAFT]":', js.includes('[DRAFT]'));
      console.log('  Contains "subdiscipline":', js.includes('subdiscipline'));
    }
  } catch (e: any) {
    console.error('Error fetching prod domain:', e.message);
  }
}

main();
