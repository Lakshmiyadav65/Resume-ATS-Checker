export type Verdict = 'ready' | 'almost' | 'needs-work';

export type ShortlistOutcome = 'yes' | 'borderline' | 'no';

export interface Prediction {
  outcome: ShortlistOutcome;
  reason: string;
}

export interface Project {
  title: string;
  body: string;
  score: number;
  issues: string[];
  rewrite: string;
}

export interface Lift {
  desc: string;
  sub: string;
  gain: number;
}

export interface AnalysisResult {
  composite: number;
  verdict: Verdict;
  prediction: Prediction;
  matchScore: number;
  projAvg: number;
  formatScore: number;
  matched: string[];
  missing: string[];
  projects: Project[];
  hasContact: boolean;
  hasSections: boolean;
  lifts: Lift[];
}

export interface AnalyzeRequest {
  resume: string;
  jd: string;
}

export interface ParseResumeResponse {
  text: string;
  warning?: 'parser_garbled';
}
