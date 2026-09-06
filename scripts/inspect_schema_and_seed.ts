import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { profileData } from '../src/content/profile';
import { educationData } from '../src/content/education';
import { experienceData } from '../src/content/experience';
import { projectsData } from '../src/content/projects';
import { researchData } from '../src/content/research';
import { publicationsData } from '../src/content/publications';
import { patentsData } from '../src/content/patents';
import { achievementsData } from '../src/content/achievements';
import { certificationsData } from '../src/content/certifications';
import { skillsData } from '../src/content/skills';
import { organizationsData } from '../src/content/organizations';
import { blogPostsData } from '../src/content/blog';

interface ColumnMeta {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
}

function getTableMetadata(): Record<string, Record<string, ColumnMeta>> {
  const output = execSync(
    'npx supabase db query --linked "SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = \'public\';"',
    { encoding: 'utf8' }
  );
  
  const fullJson = output.substring(output.indexOf('{'), output.lastIndexOf('}') + 1);
  const parsed = JSON.parse(fullJson);
  const rows: ColumnMeta[] = parsed.rows;
  
  const meta: Record<string, Record<string, ColumnMeta>> = {};
  for (const r of rows) {
    if (!meta[r.table_name]) meta[r.table_name] = {};
    meta[r.table_name][r.column_name] = r;
  }
  return meta;
}

const tableMeta = getTableMetadata();
console.log("Found table metadata for:", Object.keys(tableMeta));

function escapeValue(val: any, colMeta?: ColumnMeta): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);

  const isPostgresArray = colMeta?.data_type === 'ARRAY';
  const isJsonb = colMeta?.data_type === 'jsonb' || colMeta?.udt_name === 'jsonb';

  if (Array.isArray(val)) {
    if (isPostgresArray) {
      const elements = val.map(v => {
        if (typeof v === 'object') {
          return `"${JSON.stringify(v).replace(/"/g, '\\"')}"`;
        }
        return `"${String(v).replace(/"/g, '\\"')}"`;
      }).join(',');
      return `'${elements ? `{${elements}}` : '{}'}'`;
    }
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }

  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }

  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildInsertStatement(tableName: string, rowData: Record<string, any>, onConflictClause: string = 'ON CONFLICT DO NOTHING'): string | null {
  const meta = tableMeta[tableName];
  if (!meta) return null;

  const validCols = Object.keys(rowData).filter(c => meta[c] !== undefined);
  if (validCols.length === 0) return null;

  const colsStr = validCols.join(', ');
  const valsStr = validCols.map(c => escapeValue(rowData[c], meta[c])).join(', ');

  return `INSERT INTO public.${tableName} (${colsStr}) VALUES (${valsStr}) ${onConflictClause};`;
}

const sqlStatements: string[] = [
  '-- SEEDING CANONICAL DRAFT RECORDS FROM STATIC ARCHIVE',
  'BEGIN;'
];

// 1. Profile
if (tableMeta['profiles']) {
  const stmt = buildInsertStatement('profiles', {
    full_name: profileData.fullName,
    display_name: profileData.displayName,
    headline: profileData.headline,
    short_bio: profileData.shortBio,
    long_bio: Array.isArray(profileData.longBio) ? profileData.longBio.join('\n\n') : profileData.longBio,
    location: profileData.location,
    email: profileData.email,
    profile_image_url: profileData.avatarUrl,
    avatar_url: profileData.avatarUrl,
    resume_url: profileData.resumeUrl,
    github_url: profileData.socials?.github,
    linkedin_url: profileData.socials?.linkedin,
    google_scholar_url: profileData.socials?.googleScholar,
    researchgate_url: profileData.socials?.researchGate,
    publication_status: 'draft',
    verification_status: profileData.verificationStatus || 'USER_PROVIDED',
    last_verified: new Date().toISOString()
  });
  if (stmt) sqlStatements.push(stmt);
}

// 2. Education
if (tableMeta['education']) {
  educationData.forEach((edu, idx) => {
    const stmt = buildInsertStatement('education', {
      institution: edu.institution,
      degree: edu.degree,
      field: edu.fieldOfStudy || edu.degree,
      field_of_study: edu.fieldOfStudy || edu.degree,
      start_date: edu.startDate,
      end_date: edu.endDate,
      is_current: edu.isCurrent || false,
      grade: edu.grade,
      location: edu.location,
      description: edu.description,
      display_order: idx,
      publication_status: 'draft',
      verification_status: edu.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    });
    if (stmt) sqlStatements.push(stmt);
  });
}

// 3. Experience
if (tableMeta['experience']) {
  experienceData.forEach((exp, idx) => {
    const stmt = buildInsertStatement('experience', {
      organization: exp.organization,
      role: exp.role,
      role_title: exp.role,
      category: 'employment',
      employment_type: 'Full-time',
      start_date: exp.startDate,
      end_date: exp.endDate,
      is_current: exp.isCurrent || false,
      location: exp.location,
      work_mode: 'on_site',
      description: exp.description,
      responsibilities: exp.responsibilities || [],
      technologies: exp.technologies || [],
      evidence_url: exp.sourceUrl,
      display_order: idx,
      publication_status: 'draft',
      verification_status: exp.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    });
    if (stmt) sqlStatements.push(stmt);
  });
}

// 4. Projects
if (tableMeta['projects']) {
  projectsData.forEach((proj, idx) => {
    const challengesArray = (proj.challenges || []).map(c => 
      typeof c === 'object' ? `${c.challenge}: ${c.solution} (${c.outcome})` : String(c)
    );
    const stmt = buildInsertStatement('projects', {
      slug: proj.slug,
      title: proj.title,
      subtitle: proj.tagline,
      category: proj.category,
      timeframe: proj.startDate,
      overview: proj.approach || proj.objective || proj.problem || proj.title,
      problem: proj.problem,
      solution: proj.approach,
      architecture: proj.architectureDescription,
      subsystems: proj.subsystems || [],
      hardware_specs: proj.hardwareStack || [],
      software_stack: proj.softwareStack || [],
      algorithms: proj.algorithms || [],
      challenges: tableMeta['projects']['challenges']?.data_type === 'ARRAY' ? challengesArray : (proj.challenges || []),
      results: proj.results?.summary || [],
      limitations: proj.lessonsLearned || [],
      future_work: proj.futureWork || [],
      github_url: proj.githubUrl,
      cover_image: proj.coverImage,
      featured: proj.featured || false,
      display_order: idx,
      publication_status: 'draft',
      verification_status: proj.verificationStatus || 'GITHUB_VERIFIED',
      last_verified: new Date().toISOString()
    }, 'ON CONFLICT (slug) DO NOTHING');
    if (stmt) sqlStatements.push(stmt);
  });
}

// 5. Research Programs
if (tableMeta['research_programs']) {
  researchData.forEach((prog, idx) => {
    const stmt = buildInsertStatement('research_programs', {
      slug: prog.slug,
      title: prog.title,
      area: prog.area || 'Robotics & Control Systems',
      research_area: prog.area || 'Robotics & Control Systems',
      summary: prog.summary || prog.description || prog.title,
      research_question: prog.objectives?.[0] || prog.title,
      methodology: prog.methodology || prog.approach,
      contribution: prog.impact || prog.contribution,
      key_contribution: prog.impact || prog.contribution,
      status: 'active',
      status_label: 'active',
      collaborators: prog.collaborators || [],
      display_order: idx,
      publication_status: 'draft',
      verification_status: prog.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    }, 'ON CONFLICT (slug) DO NOTHING');
    if (stmt) sqlStatements.push(stmt);
  });
}

// 6. Publications
if (tableMeta['publications']) {
  publicationsData.forEach((pub, idx) => {
    const stmt = buildInsertStatement('publications', {
      slug: pub.slug || `pub-${idx + 1}`,
      title: pub.title,
      authors: pub.authors || ['Tanishk Singhal'],
      venue: pub.venue,
      publication_type: 'conference',
      year: pub.year || 2024,
      date: pub.date,
      doi: pub.doi,
      abstract: pub.abstract || pub.description || pub.title,
      keywords: pub.keywords || pub.tags || [],
      pdf_url: pub.pdfUrl,
      pdf_asset_url: pub.pdfUrl,
      doi_url: pub.doi ? `https://doi.org/${pub.doi}` : null,
      scholar_url: pub.scholarUrl,
      researchgate_url: pub.researchGateUrl,
      display_order: idx,
      publication_status: 'draft',
      verification_status: pub.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    }, 'ON CONFLICT (slug) DO NOTHING');
    if (stmt) sqlStatements.push(stmt);
  });
}

// 7. Patents
if (tableMeta['patents']) {
  patentsData.forEach((pat, idx) => {
    const stmt = buildInsertStatement('patents', {
      slug: pat.slug || `patent-${idx + 1}`,
      title: pat.title,
      inventors: pat.inventors || ['Tanishk Singhal'],
      application_number: pat.applicationNumber || 'IN-PENDING',
      patent_number: pat.patentNumber,
      jurisdiction: pat.jurisdiction || 'India (IN)',
      filing_date: pat.filingDate || '2024',
      publication_date: pat.publicationDate,
      status: 'pending',
      assignee: pat.assignee,
      abstract: pat.abstract || pat.description || pat.title,
      description: pat.abstract || pat.description || pat.title,
      registry_url: pat.registryUrl || pat.sourceUrl,
      display_order: idx,
      publication_status: 'draft',
      verification_status: pat.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    }, 'ON CONFLICT (slug) DO NOTHING');
    if (stmt) sqlStatements.push(stmt);
  });
}

// 8. Achievements
if (tableMeta['achievements']) {
  achievementsData.forEach((ach, idx) => {
    const stmt = buildInsertStatement('achievements', {
      title: ach.title,
      issuer: ach.issuer || ach.organization || 'Awarding Body',
      date: ach.date || ach.year || '2024',
      category: 'honor',
      description: ach.description || ach.title,
      evidence_url: ach.evidenceUrl || ach.sourceUrl,
      display_order: idx,
      publication_status: 'draft',
      verification_status: ach.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    });
    if (stmt) sqlStatements.push(stmt);
  });
}

// 9. Certifications
if (tableMeta['certifications']) {
  certificationsData.forEach((cert, idx) => {
    const stmt = buildInsertStatement('certifications', {
      name: cert.name || cert.title,
      issuing_organization: cert.issuer || cert.organization || 'Issuing Authority',
      credential_id: cert.credentialId,
      issue_date: cert.issueDate || cert.date || '2024',
      expiry_date: cert.expiryDate,
      verification_url: cert.verificationUrl || cert.url,
      description: cert.description,
      display_order: idx,
      publication_status: 'draft',
      verification_status: cert.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    });
    if (stmt) sqlStatements.push(stmt);
  });
}

// 10. Skills
if (tableMeta['skills']) {
  skillsData.forEach((sk, idx) => {
    let cat = sk.category || 'Programming';
    if (cat.includes('Robotics')) cat = 'Robotics';
    else if (cat.includes('AI') || cat.includes('Machine Learning')) cat = 'AI / ML';
    else if (cat.includes('Embedded')) cat = 'Embedded Systems';
    else if (cat.includes('Control')) cat = 'Control Systems';
    else if (cat.includes('CAD')) cat = 'CAD / Engineering Tools';
    else if (!['Robotics', 'Autonomous Systems', 'AI / ML', 'Embedded Systems', 'Firmware', 'Electronics', 'UAVs', 'ROS 2', 'Control Systems', 'Programming', 'CAD / Engineering Tools', 'General'].includes(cat)) {
      cat = 'Programming';
    }

    const stmt = buildInsertStatement('skills', {
      name: sk.name,
      category: cat,
      description: sk.description,
      proficiency_level: 'Advanced',
      display_order: idx,
      publication_status: 'draft',
      verification_status: sk.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    });
    if (stmt) sqlStatements.push(stmt);
  });
}

// 11. Organizations
if (tableMeta['organizations']) {
  organizationsData.forEach((org, idx) => {
    const stmt = buildInsertStatement('organizations', {
      name: org.name,
      role: org.role || 'Member',
      type: org.type || 'Academic',
      start_date: org.startDate || '2024',
      end_date: org.endDate,
      is_current: org.isCurrent || false,
      location: org.location,
      description: org.description,
      official_url: org.url || org.officialUrl,
      display_order: idx,
      publication_status: 'draft',
      verification_status: org.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    });
    if (stmt) sqlStatements.push(stmt);
  });
}

// 12. Blog Posts
if (tableMeta['blog_posts']) {
  blogPostsData.forEach((bp, idx) => {
    const stmt = buildInsertStatement('blog_posts', {
      slug: bp.slug,
      title: bp.title,
      excerpt: bp.excerpt || bp.summary || bp.title,
      content: bp.content || bp.body || bp.excerpt || bp.title,
      body: bp.content || bp.body || bp.excerpt || bp.title,
      cover_image: bp.coverImage,
      tags: bp.tags || [],
      category: bp.category || 'Engineering',
      author: bp.author || 'Tanishk Singhal',
      reading_time_minutes: bp.readingTimeMinutes || bp.readingTime || 5,
      seo_title: bp.title,
      seo_description: bp.excerpt,
      display_order: idx,
      publication_status: 'draft',
      verification_status: bp.verificationStatus || 'USER_PROVIDED',
      last_verified: new Date().toISOString()
    }, 'ON CONFLICT (slug) DO NOTHING');
    if (stmt) sqlStatements.push(stmt);
  });
}

sqlStatements.push('COMMIT;');

const sqlOut = path.join(process.cwd(), 'supabase/migrations/0005_seed_static_content_as_draft.sql');
fs.writeFileSync(sqlOut, sqlStatements.join('\n\n'), 'utf8');
console.log(`Generated tailored seed migration with ${sqlStatements.length} statements at ${sqlOut}`);
