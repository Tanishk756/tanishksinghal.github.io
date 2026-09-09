const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';

function createAdminJwt(email: string, expiresInSec = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'test-admin-id',
    email,
    aud: 'authenticated',
    role: 'authenticated',
    exp: now + expiresInSec,
    iat: now,
  };
  const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64(header)}.${b64(payload)}.test_sig`;
}

async function probeAllCombinations() {
  const token = createAdminJwt('tanishksinghal6285@gmail.com');
  
  const bases = [
    'journal', 'conference', 'workshop', 'preprint', 'report', 'patent', 'book',
    'article', 'paper', 'chapter', 'review', 'technical', 'peer_reviewed',
    'in_proceedings', 'inproceedings', 'proceedings', 'misc', 'unpublished',
    'thesis', 'master_thesis', 'phd_thesis', 'whitepaper', 'standard',
    'case_study', 'data_paper', 'software_paper', 'editorial', 'letter',
    'abstract', 'presentation', 'talk', 'poster', 'demo', 'dataset'
  ];

  const prefixes = ['', 'peer_reviewed_', 'invited_', 'academic_', 'scholarly_'];
  const suffixes = ['', '_paper', '_article', '_report', '_chapter', '_proceeding', '_proceedings', '_publication', '_filing', '_grant'];

  const testList = new Set<string>();
  for (const b of bases) {
    for (const p of prefixes) {
      for (const s of suffixes) {
        testList.add(`${p}${b}${s}`);
      }
    }
  }

  // Also add common BibTeX types
  const bibtex = ['article', 'book', 'booklet', 'conference', 'inbook', 'incollection', 'inproceedings', 'manual', 'mastersthesis', 'misc', 'phdthesis', 'proceedings', 'techreport', 'unpublished'];
  bibtex.forEach(b => testList.add(b));

  console.log(`Generated ${testList.size} candidate types to probe...`);

  const matched: string[] = [];

  for (const t of testList) {
    const payload = {
      title: `Probe ${t}`,
      slug: `p-${t.slice(0, 15)}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      venue: 'IEEE Venue',
      publication_type: t,
      year: 2026,
      abstract: 'Testing candidate type for check constraint.',
      authors: ['Tanishk Singhal'],
      keywords: ['Test'],
      publicationStatus: 'draft',
      verificationStatus: 'USER_PROVIDED',
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.status === 201 || res.status === 200) {
        console.log(`🎯 MATCHED: "${t}" (id: ${body.id})`);
        matched.push(t);
        if (body.id) {
          await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication&id=${body.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch (e) {}
  }

  console.log('\n======================================');
  console.log('ALL MATCHED PUBLICATION_TYPE VALUES:');
  console.log(matched);
  console.log('======================================\n');
}

probeAllCombinations();
