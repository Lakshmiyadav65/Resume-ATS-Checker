import { checkContact, checkSections } from './format';
import { findProjects } from './projects';
import type { InputWarning } from '@/types/analysis';

// A resume that scores well only because the job description was pasted into the
// resume box produces a meaningless (inflated) match score. These checks catch
// that class of input so the UI can flag the score instead of presenting it as
// real.

function tokenSet(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9+.#-]*/g) || [];
  return new Set(words);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

const JOB_POSTING_MARKERS =
  /\b(we['’]?re hiring|we are hiring|we are looking for|responsibilities|required skills|requirements|nice to have|what you['’]?ll do|about the role|about the job|job description|apply now|equal opportunity|minimum qualifications|preferred qualifications)\b/i;

export function validateResumeInput(resume: string, jd: string): InputWarning | null {
  // 1. The resume box holds (essentially) the job description itself.
  if (jaccard(tokenSet(resume), tokenSet(jd)) >= 0.8) {
    return {
      kind: 'resume-is-job-description',
      message:
        'The resume box contains the job description, not your resume. The score only reflects the posting compared against itself — paste your actual resume for a real result.',
    };
  }

  // 2. Nothing that identifies the text as a resume at all.
  const hasContact = checkContact(resume);
  const hasSections = checkSections(resume);
  const hasProjects = findProjects(resume).length > 0;

  if (!hasContact && !hasSections && !hasProjects) {
    const looksLikePosting = JOB_POSTING_MARKERS.test(resume);
    return {
      kind: 'not-a-resume',
      message: looksLikePosting
        ? "This reads like a job posting, not a resume — no contact details, standard sections, or projects were found. Paste your full resume text for an accurate score."
        : "This doesn't look like a resume — no contact details, standard sections (Education, Skills, Experience, Projects), or projects were found. Paste your full resume text for an accurate score.",
    };
  }

  return null;
}
