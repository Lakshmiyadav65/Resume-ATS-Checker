import { compareKeywords, matchScore } from './keywords';
import { findProjects, scoreProject, projectAverage, type ScoredProject } from './projects';
import { checkContact, checkSections, formatScore } from './format';
import { compositeScore, verdictFor } from './composite';
import { generateLifts } from './lifts';
import { predictShortlist } from './prediction';
import type { AnalysisResult, Project } from '@/types/analysis';

export interface RunAnalysisResult extends AnalysisResult {
  scoredProjects: ScoredProject[];
}

export function runAnalysis(resume: string, jd: string): RunAnalysisResult {
  const { matched, missing } = compareKeywords(resume, jd);
  const ms = matchScore(matched, missing);

  const scoredProjects = findProjects(resume).map(scoreProject);
  const projAvg = projectAverage(scoredProjects);

  const hasContact = checkContact(resume);
  const hasSections = checkSections(resume);
  const fs = formatScore(hasContact, hasSections);

  const composite = compositeScore(ms, projAvg, fs);
  const verdict = verdictFor(composite);

  const projects: Project[] = scoredProjects.map(({ detectedTech: _t, ...rest }) => rest);
  const lifts = generateLifts({ missing, projects, hasContact });
  const prediction = predictShortlist({
    composite,
    matchScore: ms,
    projAvg,
    formatScore: fs,
    missing,
    projects,
    hasContact,
    hasSections,
  });

  return {
    composite,
    verdict,
    prediction,
    matchScore: ms,
    projAvg,
    formatScore: fs,
    matched,
    missing,
    projects,
    hasContact,
    hasSections,
    lifts,
    scoredProjects,
  };
}
