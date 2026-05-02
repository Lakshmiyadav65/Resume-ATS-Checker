import { SKILL_TAXONOMY } from '@/lib/data/skills-taxonomy';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_TAXONOMY.filter((skill) => {
    const re = new RegExp('(^|[^a-z])' + escapeRegex(skill) + '($|[^a-z])', 'i');
    return re.test(lower);
  });
}

export function compareKeywords(resume: string, jd: string): {
  matched: string[];
  missing: string[];
} {
  const resumeKeywords = extractKeywords(resume);
  const jdKeywords = extractKeywords(jd);
  const matched = jdKeywords.filter((k) => resumeKeywords.includes(k));
  const missing = jdKeywords.filter((k) => !resumeKeywords.includes(k));
  return { matched, missing };
}

export function matchScore(matched: string[], missing: string[]): number {
  const total = matched.length + missing.length;
  if (total === 0) return 50;
  return Math.round((matched.length / total) * 100);
}
