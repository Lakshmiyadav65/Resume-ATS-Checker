export interface TailoredContact {
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export interface TailoredEducation {
  degree: string;
  school: string;
  dates?: string;
  details?: string;
}

export interface TailoredProject {
  title: string;
  bullets: string[];
}

export interface TailoredExperience {
  title: string;
  company: string;
  dates?: string;
  bullets: string[];
}

export interface TailoredResume {
  name: string;
  contact: TailoredContact;
  summary?: string;
  skills: string[];
  education: TailoredEducation[];
  projects: TailoredProject[];
  experience: TailoredExperience[];
}

export interface TailorRequest {
  resume: string;
  jd: string;
}

export interface TailorScore {
  composite: number;
  matchScore: number;
  projAvg: number;
  formatScore: number;
  matchedCount: number;
  missingCount: number;
}

/** Every export is built once server-side and shipped with the response, so the
 *  client previews first and downloads the exact same bytes on demand. A format
 *  that fails to build is null (its button is hidden) rather than a hard error. */
export interface TailorExports {
  docxBase64: string | null;
  pdfBase64: string | null;
  /** LaTeX source for Overleaf (plain text, not base64). */
  latex: string | null;
}

export interface TailorResponse {
  mode: 'llm' | 'fallback';
  tailored: TailoredResume;
  /** Base filename without extension, e.g. "Jordan_Lee_tailored". */
  filenameBase: string;
  exports: TailorExports;
  placeholders: number;
  before: TailorScore;
  after: TailorScore;
}
