import type { Lift, Project } from '@/types/analysis';

export function generateLifts(input: {
  missing: string[];
  projects: Project[];
  hasContact: boolean;
}): Lift[] {
  const lifts: Lift[] = [];

  if (input.missing.length) {
    const top = input.missing.slice(0, 4);
    lifts.push({
      desc: `**Add the missing keywords** — ${top.join(', ')}`,
      sub: 'Weave them naturally into your project bullets, not just the skills list.',
      gain: Math.min(20, top.length * 4),
    });
  }

  for (const p of input.projects) {
    if (p.score < 70) {
      lifts.push({
        desc: `**Rewrite the "${p.title}" bullet**`,
        sub: 'Use the suggested rewrite above — it adds numbers and tech specifics.',
        gain: Math.round((100 - p.score) * 0.15),
      });
    }
  }

  if (!input.hasContact) {
    lifts.push({
      desc: '**Add complete contact info**',
      sub: 'Email and phone in plain text at the top — no icons or images.',
      gain: 8,
    });
  }

  if (lifts.length === 0) {
    lifts.push({
      desc: '**Looking solid.**',
      sub: 'Consider a short summary line at the top tailored to this role.',
      gain: 3,
    });
  }

  return lifts;
}
