import { groqChat } from './client';
import { buildRewritePrompt, type RewritePromptInput } from './prompts';

export function deterministicRewrite(input: {
  title: string;
  detectedTech: string[];
}): string {
  const t = input.title.toLowerCase();
  if (t.includes('portfolio')) {
    return 'Designed and shipped a responsive portfolio site using React, Tailwind, and Vite; deployed to Vercel with a 95+ Lighthouse performance score and under 1-second load time.';
  }
  if (t.includes('movie') || t.includes('recommend')) {
    return 'Built a content-based movie recommendation engine in Python using pandas and scikit-learn; processed a 10K-film dataset and surfaced top-5 matches with cosine similarity (84% relevance in testing with 30 peers).';
  }
  const stack = input.detectedTech.length ? input.detectedTech.slice(0, 3).join(', ') : 'React, TypeScript';
  return `Built ${input.title} using ${stack}; [add a measurable outcome — e.g. served N users, reduced load time by X%, processed Z items].`;
}

export async function rewriteBullet(input: RewritePromptInput): Promise<string> {
  const fallback = () =>
    deterministicRewrite({ title: input.title, detectedTech: input.detectedTech });

  const text = await groqChat({
    messages: [{ role: 'user', content: buildRewritePrompt(input) }],
    maxTokens: 300,
    temperature: 0.4,
    json: true,
  });
  if (!text) return fallback();

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as { rewrite?: string };
    if (typeof parsed.rewrite === 'string' && parsed.rewrite.length > 0) {
      return parsed.rewrite;
    }
    return fallback();
  } catch {
    return fallback();
  }
}
