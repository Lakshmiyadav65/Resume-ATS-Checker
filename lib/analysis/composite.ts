import type { Verdict } from '@/types/analysis';

export function compositeScore(matchScore: number, projAvg: number, formatScore: number): number {
  return Math.round(matchScore * 0.45 + projAvg * 0.35 + formatScore * 0.2);
}

export function verdictFor(composite: number): Verdict {
  if (composite >= 80) return 'ready';
  if (composite >= 60) return 'almost';
  return 'needs-work';
}
