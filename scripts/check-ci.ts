import https from 'https';

async function checkActions(): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/Tanishk756/tanishksinghal.github.io/actions/runs?per_page=5',
      headers: { 'User-Agent': 'Tanishk-Publish-Audit' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.workflow_runs) {
            console.log('API Response:', data);
            return resolve();
          }
          console.log('=== GITHUB ACTIONS RUNS ===');
          for (const run of parsed.workflow_runs) {
            console.log(`- Workflow: ${run.name}`);
            console.log(`  Commit SHA: ${run.head_sha}`);
            console.log(`  Status: ${run.status} | Conclusion: ${run.conclusion}`);
            console.log(`  URL: ${run.html_url}`);
            console.log(`  Created: ${run.created_at} | Updated: ${run.updated_at}`);
            console.log('--------------------------------------------------');
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

checkActions().catch(console.error);
