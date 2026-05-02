import { getAnthropic, MODEL } from './client';
import type { TailoredResume } from '@/types/tailored';

const TAILOR_SYSTEM_PROMPT = `You are a resume tailoring assistant. Your job is to take an existing resume and a target job description, then produce a NEW resume that:
1. Aligns terminology with the job description (using the JD's preferred phrasing for skills the candidate already has)
2. Reorders and emphasizes content most relevant to the role
3. Rewrites every project and experience bullet in the XYZ format ("Accomplished X by doing Y, measured by Z") — start each with a strong action verb (Built, Designed, Shipped, Optimized, Engineered, etc.)
4. Includes quantified outcomes wherever the original suggests them — and uses [bracketed placeholders] when the candidate must fill in a real number
5. Weaves in keywords from the job description ONLY where the candidate plausibly has the skill — never invent expertise

You MUST respond with strict JSON only, no markdown, no prose. The JSON must match this TypeScript interface:

interface TailoredResume {
  name: string;
  contact: { email?: string; phone?: string; github?: string; linkedin?: string; website?: string; location?: string };
  summary?: string;          // 1-2 sentence summary tailored to the role
  skills: string[];          // flat list, prioritized by JD relevance
  education: { degree: string; school: string; dates?: string; details?: string }[];
  projects: { title: string; bullets: string[] }[];
  experience: { title: string; company: string; dates?: string; bullets: string[] }[];
}`;

function buildUserPrompt(resume: string, jd: string): string {
  return `ORIGINAL RESUME:
${resume}

TARGET JOB DESCRIPTION:
${jd.slice(0, 4000)}

Produce the tailored resume now as strict JSON matching the TailoredResume interface. No preamble, no markdown fences.`;
}

function safeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === 'string').map((x) => (x as string).trim()).filter(Boolean);
}

function coerce(raw: unknown): TailoredResume | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (!name) return null;

  const contactRaw = (r.contact && typeof r.contact === 'object' ? r.contact : {}) as Record<string, unknown>;
  const contact = {
    email: typeof contactRaw.email === 'string' ? contactRaw.email : undefined,
    phone: typeof contactRaw.phone === 'string' ? contactRaw.phone : undefined,
    github: typeof contactRaw.github === 'string' ? contactRaw.github : undefined,
    linkedin: typeof contactRaw.linkedin === 'string' ? contactRaw.linkedin : undefined,
    website: typeof contactRaw.website === 'string' ? contactRaw.website : undefined,
    location: typeof contactRaw.location === 'string' ? contactRaw.location : undefined,
  };

  const education = Array.isArray(r.education)
    ? r.education
        .map((e) => {
          if (!e || typeof e !== 'object') return null;
          const ed = e as Record<string, unknown>;
          const degree = typeof ed.degree === 'string' ? ed.degree : '';
          const school = typeof ed.school === 'string' ? ed.school : '';
          if (!degree && !school) return null;
          return {
            degree,
            school,
            dates: typeof ed.dates === 'string' ? ed.dates : undefined,
            details: typeof ed.details === 'string' ? ed.details : undefined,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  const projects = Array.isArray(r.projects)
    ? r.projects
        .map((p) => {
          if (!p || typeof p !== 'object') return null;
          const pp = p as Record<string, unknown>;
          const title = typeof pp.title === 'string' ? pp.title : '';
          const bullets = safeStringArray(pp.bullets);
          if (!title && bullets.length === 0) return null;
          return { title, bullets };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  const experience = Array.isArray(r.experience)
    ? r.experience
        .map((x) => {
          if (!x || typeof x !== 'object') return null;
          const xx = x as Record<string, unknown>;
          const title = typeof xx.title === 'string' ? xx.title : '';
          const company = typeof xx.company === 'string' ? xx.company : '';
          const bullets = safeStringArray(xx.bullets);
          if (!title && !company && bullets.length === 0) return null;
          return {
            title,
            company,
            dates: typeof xx.dates === 'string' ? xx.dates : undefined,
            bullets,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  return {
    name,
    contact,
    summary: typeof r.summary === 'string' ? r.summary : undefined,
    skills: safeStringArray(r.skills),
    education,
    projects,
    experience,
  };
}

export async function tailorResumeWithLLM(input: { resume: string; jd: string }): Promise<TailoredResume | null> {
  const client = getAnthropic();
  if (!client) return null;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: TAILOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(input.resume, input.jd) }],
    });

    const block = response.content[0];
    const text = block && block.type === 'text' ? block.text : '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed: unknown = JSON.parse(cleaned);
    return coerce(parsed);
  } catch {
    return null;
  }
}
