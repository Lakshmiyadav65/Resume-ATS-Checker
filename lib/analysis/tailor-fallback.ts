import { compareKeywords } from './keywords';
import { findProjects, scoreProject } from './projects';
import { deterministicRewrite } from '@/lib/llm/rewrite-bullet';
import type { TailoredResume } from '@/types/tailored';

function extractName(resume: string): string {
  const lines = resume.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (/@/.test(line) || /\d{3}/.test(line)) continue;
    if (line.length < 50 && /^[A-Z][A-Za-z .'-]+$/.test(line)) return line;
  }
  return lines[0] || 'Your Name';
}

function extractContact(resume: string): TailoredResume['contact'] {
  const email = resume.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const phone = resume.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/)?.[0];
  const github = resume.match(/github\.com\/[\w-]+/i)?.[0];
  const linkedin = resume.match(/linkedin\.com\/in\/[\w-]+/i)?.[0];
  return { email, phone, github, linkedin };
}

function extractSection(resume: string, headerRegex: RegExp): string {
  const m = resume.match(
    new RegExp(headerRegex.source + '\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]{2,}\\n|$)', 'i'),
  );
  return m ? m[1].trim() : '';
}

function parseEducation(block: string): TailoredResume['education'] {
  if (!block) return [];
  const blocks = block.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b) => {
    const lines = b.split('\n').map((l) => l.trim());
    const first = lines[0] || '';
    const rest = lines.slice(1).join(' · ');
    const dates = first.match(/\b(19|20)\d{2}\b/)?.[0];
    return { degree: first, school: '', dates, details: rest || undefined };
  });
}

function parseSkills(block: string): string[] {
  if (!block) return [];
  return block
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseExperience(block: string): TailoredResume['experience'] {
  if (!block) return [];
  const blocks = block.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b) => {
    const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
    const header = lines[0] || '';
    const dates = header.match(/\(([^)]+)\)|\b(19|20)\d{2}.*$/)?.[0];
    const cleaned = header.replace(/\(([^)]+)\)/, '').trim();
    const [titlePart, ...rest] = cleaned.split(',');
    return {
      title: titlePart?.trim() || header,
      company: rest.join(',').trim(),
      dates,
      bullets: lines.slice(1),
    };
  });
}

export function deterministicTailor(input: { resume: string; jd: string }): TailoredResume {
  const { missing } = compareKeywords(input.resume, input.jd);

  const name = extractName(input.resume);
  const contact = extractContact(input.resume);

  const projects = findProjects(input.resume).map(scoreProject).map((p) => ({
    title: p.title,
    bullets: [
      p.score < 80
        ? deterministicRewrite({ title: p.title, detectedTech: p.detectedTech })
        : p.body,
    ],
  }));

  const educationBlock = extractSection(input.resume, /education/);
  const education = parseEducation(educationBlock);

  const skillsBlock = extractSection(input.resume, /skills/);
  const existing = parseSkills(skillsBlock);
  const skills = Array.from(
    new Set([
      ...existing,
      ...missing.map((k) => k.replace(/\b\w/g, (c) => c.toUpperCase())),
    ]),
  );

  const experienceBlock = extractSection(input.resume, /experience/);
  const experience = parseExperience(experienceBlock);

  const summary = buildSummary(input.jd, skills);

  return { name, contact, summary, skills, education, projects, experience };
}

function buildSummary(jd: string, skills: string[]): string {
  const role = jd.split('\n')[0]?.trim() || 'this role';
  const top = skills.slice(0, 5).join(', ');
  return `Computer science student targeting ${role}. Strengths in ${top}. Open to internship and full-time opportunities.`;
}
