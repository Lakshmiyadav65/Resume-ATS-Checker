import type { Prediction, Project, ShortlistOutcome } from '@/types/analysis';

interface PredictionInput {
  composite: number;
  matchScore: number;
  projAvg: number;
  formatScore: number;
  missing: string[];
  projects: Project[];
  hasContact: boolean;
  hasSections: boolean;
}

export function predictShortlist(input: PredictionInput): Prediction {
  const outcome: ShortlistOutcome =
    input.composite >= 78 ? 'yes' : input.composite >= 60 ? 'borderline' : 'no';

  const reason = pickReason(outcome, input);
  return { outcome, reason };
}

function pickReason(outcome: ShortlistOutcome, input: PredictionInput): string {
  if (outcome === 'yes') {
    return 'Strong keyword match and quality projects — apply with confidence.';
  }

  type Candidate = { weight: number; text: string };
  const candidates: Candidate[] = [];

  if (input.matchScore < 70 && input.missing.length > 0) {
    const top = input.missing.slice(0, 3).join(', ');
    const noun = input.missing.length === 1 ? 'keyword' : 'keywords';
    candidates.push({
      weight: (100 - input.matchScore) * 0.45,
      text: `${input.missing.length} ${noun} from the job posting are missing — start with ${top}.`,
    });
  }

  const weakProjects = input.projects.filter((p) => p.score < 60);
  if (weakProjects.length > 0) {
    candidates.push({
      weight: (100 - input.projAvg) * 0.35,
      text:
        weakProjects.length === 1
          ? `Rewrite "${weakProjects[0].title}" with quantified outcomes and stronger verbs.`
          : `${weakProjects.length} project bullets read as vague — rewrite them with numbers and specifics.`,
    });
  }

  if (!input.hasContact) {
    candidates.push({
      weight: 12,
      text: 'No clear contact info detected — many ATS tools reject resumes that lack a plain-text email and phone.',
    });
  }

  if (!input.hasSections) {
    candidates.push({
      weight: 10,
      text: 'Add clearly labeled Education and Skills/Experience/Projects sections so the parser can find them.',
    });
  }

  if (candidates.length === 0) {
    return outcome === 'borderline'
      ? 'You\'re close — polishing your bullets would push you over the line.'
      : 'Tighten keywords, rewrite weak bullets, and confirm your sections are clearly labeled.';
  }

  candidates.sort((a, b) => b.weight - a.weight);
  return candidates[0].text;
}
