async function main() {
  const res = await fetch('https://api.github.com/repos/Tanishk756/tanishksinghal.github.io/actions/runs?per_page=10', {
    headers: { 'User-Agent': 'Node' }
  });
  const data = await res.json();
  console.log('Total workflow runs:', data.total_count);
  for (const run of data.workflow_runs || []) {
    console.log(`Run ${run.id}: [${run.name}] - Status: ${run.status} - Conclusion: ${run.conclusion} - Head SHA: ${run.head_sha} - Commit Message: ${run.head_commit?.message?.split('\n')[0]} - Created: ${run.created_at} - Updated: ${run.updated_at}`);
  }
}
main().catch(console.error);
