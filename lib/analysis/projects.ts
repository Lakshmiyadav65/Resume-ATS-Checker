import { SKILL_TAXONOMY } from '@/lib/data/skills-taxonomy';
import { VAGUE_PHRASES } from '@/lib/data/vague-phrases';
import { STRONG_VERBS } from '@/lib/data/strong-verbs';
import type { Project } from '@/types/analysis';

interface RawProject {
  title: string;
  body: string;
}

export function findProjects(resume: string): RawProject[] {
  const projSection = resume.match(/projects?\s*\n([\s\S]*?)(?=\n[A-Z][A-Z\s]{2,}\n|$)/i);
  if (!projSection) return [];

  const block = projSection[1];
  const projects: RawProject[] = [];
  const lines = block.split(/\n/);
  let current: RawProject | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) {
        projects.push(current);
        current = null;
      }
      continue;
    }
    if (!current && trimmed.length < 60 && !trimmed.endsWith('.')) {
      current = { title: trimmed, body: '' };
    } else if (current) {
      current.body += (current.body ? ' ' : '') + trimmed;
    }
  }
  if (current) projects.push(current);

  return projects.filter((p) => p.body.length > 10);
}

export function detectTech(body: string): string[] {
  const lower = body.toLowerCase();
  return SKILL_TAXONOMY.filter((s) => lower.includes(s));
}

export interface ScoredProject extends Project {
  detectedTech: string[];
}

export function scoreProject(p: RawProject): ScoredProject {
  const body = p.body.toLowerCase();
  const issues: string[] = [];
  let score = 100;

  const vague = VAGUE_PHRASES.filter((v) => body.includes(v));
  if (vague.length) {
    score -= 15 * Math.min(vague.length, 2);
    issues.push(`Vague phrasing: "${vague.slice(0, 2).join('", "')}"`);
  }

  const startsStrong = STRONG_VERBS.some((v) => body.startsWith(v));
  if (!startsStrong) {
    score -= 10;
    issues.push("Doesn't open with a strong action verb (Built, Shipped, Designed…)");
  }

  const hasNumber =
    /\d+\s*(%|x|users|requests|ms|seconds|hours|kb|mb|gb)/i.test(body) ||
    /\b(reduced|increased|improved|saved|cut)\b.*\d/i.test(body);
  if (!hasNumber) {
    score -= 20;
    issues.push('No numbers or measurable impact');
  }

  const techMentioned = detectTech(body);
  if (techMentioned.length === 0) {
    score -= 15;
    issues.push('No specific technology mentioned');
  } else if (techMentioned.length < 2) {
    score -= 5;
    issues.push('Mention more of your tech stack');
  }

  if (p.body.length < 60) {
    score -= 15;
    issues.push('Too short — under one full sentence');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    title: p.title,
    body: p.body,
    score,
    issues,
    rewrite: '',
    detectedTech: techMentioned,
  };
}

export function projectAverage(projects: ScoredProject[]): number {
  if (projects.length === 0) return 40;
  return Math.round(projects.reduce((a, p) => a + p.score, 0) / projects.length);
}
