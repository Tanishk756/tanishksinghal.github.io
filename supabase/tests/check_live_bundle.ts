async function checkLiveBundle() {
  const chunkUrl = 'https://tanishksinghal.in/assets/AdminBlogEditorPage-BrO5lhxo.js';
  const chunkRes = await fetch(chunkUrl);
  const chunkText = await chunkRes.text();
  console.log(`Chunk ${chunkUrl}: Length: ${chunkText.length}`);
  console.log('Contains blog- timestamp?', chunkText.includes('blog-'));
  console.log('Contains Date.now?', chunkText.includes('Date.now()') || chunkText.includes('Date.now'));
  console.log('Contains featured:', chunkText.includes('featured'));
  console.log('Matches for blog-:', chunkText.match(/blog-[^\s"'\`]+/g));
  console.log('Snippet:', chunkText.slice(0, 1000));
}
checkLiveBundle().catch(console.error);
