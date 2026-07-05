import type { TailoredResume } from '@/types/tailored';

/**
 * Render a structured TailoredResume back into plain resume text, using the
 * ALL-CAPS section headers and blank-line-delimited entries that the analysis
 * pipeline (findProjects / extractSectionBody / checkSections) expects.
 *
 * This lets us re-score a tailored resume through the *same* analyzer the
 * original ran through, so the before/after comparison shown to the user is
 * apples-to-apples rather than two different code paths.
 */
export function tailoredToText(r: TailoredResume): string {
  const out: string[] = [];

  out.push(r.name || 'Your Name');
  const contact = [
    r.contact.email,
    r.contact.phone,
    r.contact.location,
    r.contact.github,
    r.contact.linkedin,
    r.contact.website,
  ]
    .filter((v): v is string => Boolean(v))
    .join(' | ');
  if (contact) out.push(contact);
  out.push('');

  if (r.summary) {
    out.push('SUMMARY', r.summary, '');
  }

  if (r.skills.length) {
    out.push('SKILLS', r.skills.join(', '), '');
  }

  if (r.education.length) {
    out.push('EDUCATION');
    for (const ed of r.education) {
      const head = [ed.degree, ed.school].filter(Boolean).join(', ');
      out.push(head + (ed.dates ? ` (${ed.dates})` : ''));
      if (ed.details) out.push(ed.details);
      out.push(''); // blank line delimits entries
    }
  }

  if (r.projects.length) {
    out.push('PROJECTS');
    for (const p of r.projects) {
      out.push(p.title || 'Project');
      for (const b of p.bullets) out.push(`- ${b}`);
      out.push('');
    }
  }

  if (r.experience.length) {
    out.push('EXPERIENCE');
    for (const x of r.experience) {
      const head = [x.title, x.company].filter(Boolean).join(', ');
      out.push(head + (x.dates ? ` (${x.dates})` : ''));
      for (const b of x.bullets) out.push(`- ${b}`);
      out.push('');
    }
  }

  return out.join('\n').trim() + '\n';
}

/**
 * Count `[bracketed placeholders]` the tailorer left for the candidate to fill
 * in with real numbers. Only content fields carry them.
 */
export function countPlaceholders(r: TailoredResume): number {
  const texts: string[] = [];
  if (r.summary) texts.push(r.summary);
  for (const p of r.projects) texts.push(...p.bullets);
  for (const x of r.experience) texts.push(...x.bullets);
  return (texts.join('\n').match(/\[[^\]]+\]/g) || []).length;
}
