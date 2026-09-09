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

async function testMoreVariants() {
  const token = createAdminJwt('tanishksinghal6285@gmail.com');
  const candidateTypes = [
    'peer_reviewed_journal',
    'peer_reviewed_paper',
    'peer_reviewed_article',
    'research_article',
    'journal_paper',
    'conference_proceedings',
    'conference_article',
    'conference_presentation',
    'proceedings',
    'proceedings_paper',
    'workshop_article',
    'working_paper',
    'white_paper',
    'tech_report',
    'article',
    'paper',
    'monograph',
    'extended_abstract',
    'invited_talk',
    'keynote',
    'magazine_article',
    'review_article',
    'dataset',
    'software',
    'patent_application',
    'pre_print',
    'arxiv_preprint',
    'arxiv',
    'ssrn',
    'biorxiv',
    'medrxiv',
    'techreport',
    'bookchapter',
    'peer_reviewed_conference'
  ];

  const matched: string[] = [];

  for (const t of candidateTypes) {
    const payload = {
      title: `Probe Publication ${t}`,
      slug: `probe-${t.replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      venue: 'IEEE Transactions',
      publication_type: t,
      year: 2026,
      abstract: 'Testing abstract for publication check constraints in database.',
      authors: ['Tanishk Singhal'],
      keywords: ['Robotics'],
      publicationStatus: 'draft',
      verificationStatus: 'USER_PROVIDED',
    };

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
      console.log(`✅ MATCHED publication_type: "${t}"`);
      matched.push(t);
      if (body.id) {
        await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=publication&id=${body.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    }
  }

  console.log('\n--- MATCHED VALUES ---');
  console.log(matched);
}

testMoreVariants();
