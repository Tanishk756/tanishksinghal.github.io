import { profileData } from '../src/generated/profile';
import { educationData } from '../src/generated/education';
import { experienceData } from '../src/generated/experience';
import { projectsData } from '../src/generated/projects';
import { researchData } from '../src/generated/research';
import { publicationsData } from '../src/generated/publications';
import { patentsData } from '../src/generated/patents';
import { achievementsData } from '../src/generated/achievements';
import { certificationsData } from '../src/generated/certifications';
import { skillsData } from '../src/generated/skills';
import { organizationsData } from '../src/generated/organizations';
import { blogPostsData } from '../src/generated/blog';

console.log('=== CANONICAL GENERATED DATA FIDELITY AUDIT ===');
console.log('1. Profile:', {
  fullName: profileData.fullName,
  headline: profileData.headline,
  location: profileData.location,
  email: profileData.email,
  github: profileData.socials.github,
  linkedin: profileData.socials.linkedin,
  scholar: profileData.socials.googleScholar,
  researchgate: profileData.socials.researchGate,
  source: profileData.source,
  verificationStatus: profileData.verificationStatus
});

console.log('2. Education Count:', educationData.length);
educationData.forEach((e, i) => {
  console.log(`   [${i+1}] ${e.institution} - ${e.degree} (${e.startDate} to ${e.endDate})`);
});

console.log('3. Experience Count:', experienceData.length);
experienceData.forEach((e, i) => {
  console.log(`   [${i+1}] ${e.organization} - ${e.role} (${e.startDate} to ${e.endDate}, Current: ${e.isCurrent})`);
});

console.log('4. Projects Count:', projectsData.length);
projectsData.forEach((p, i) => {
  console.log(`   [${i+1}] slug: ${p.slug} | title: "${p.title}" | category: ${p.category}`);
});

console.log('5. Research Programs Count:', researchData.length);
researchData.forEach((r, i) => {
  console.log(`   [${i+1}] slug: ${r.slug} | title: "${r.title}" | domain: ${r.domain}`);
});

console.log('6. Publications Count:', publicationsData.length);
publicationsData.forEach((p, i) => {
  console.log(`   [${i+1}] slug: ${p.slug} | title: "${p.title}" | venue: ${p.venue} (${p.year})`);
});

console.log('7. Patents Count (Empty Domain):', patentsData.length);
console.log('8. Achievements Count (Empty Domain):', achievementsData.length);
console.log('9. Certifications Count (Empty Domain):', certificationsData.length);
console.log('10. Skills Count:', skillsData.length);
console.log('11. Organizations Count:', organizationsData.length);
console.log('12. Blog Posts Count:', blogPostsData.length);
blogPostsData.forEach((b, i) => {
  console.log(`   [${i+1}] slug: ${b.slug} | title: "${b.title}" | date: ${b.publishedDate}`);
});
