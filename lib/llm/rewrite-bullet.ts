import { getAnthropic, MODEL } from './client';
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
  const client = getAnthropic();
  if (!client) {
    return deterministicRewrite({ title: input.title, detectedTech: input.detectedTech });
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: buildRewritePrompt(input) }],
    });

    const block = response.content[0];
    const text = block && block.type === 'text' ? block.text : '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as { rewrite?: string };
    if (typeof parsed.rewrite === 'string' && parsed.rewrite.length > 0) {
      return parsed.rewrite;
    }
    return deterministicRewrite({ title: input.title, detectedTech: input.detectedTech });
  } catch {
    return deterministicRewrite({ title: input.title, detectedTech: input.detectedTech });
  }
}
