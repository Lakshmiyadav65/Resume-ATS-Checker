// Section detection utilities.
//
// The previous approach used a single case-insensitive regex whose boundary
// pattern `[A-Z][A-Z\s]{2,}` was meant to detect the next ALL-CAPS section
// header (e.g. SKILLS). Because the regex carried the `/i` flag, `[A-Z]` also
// matched lowercase, so the boundary fired on ordinary title-case lines (like a
// project title "Movie Recommendation App") — truncating every section to its
// first entry. These helpers detect headers explicitly instead.

const KNOWN_HEADERS =
  /^(summary|objective|profile|about( me)?|contact|education|experience|work experience|professional experience|employment( history)?|projects?|personal projects|technical skills|skills|core competencies|certifications?|achievements?|accomplishments|awards?|honors?|publications?|volunteer(ing)?|leadership|activities|extracurriculars?|languages?|interests?|hobbies|references|coursework|relevant coursework)\s*:?\s*$/i;

/**
 * True when a line reads as a resume section header — either a known header
 * keyword (case-insensitive, e.g. "Skills") or an ALL-CAPS banner line
 * (case-sensitive, e.g. "WORK EXPERIENCE").
 */
export function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (KNOWN_HEADERS.test(t)) return true;
  // ALL-CAPS banner line: starts with a capital, only caps / spaces / & / /,
  // at least 3 chars. Case-sensitive on purpose so title-case lines don't match.
  if (/^[A-Z][A-Z\s&/]{2,}$/.test(t)) return true;
  return false;
}

/**
 * Returns the body of the first section whose header line matches
 * `headerMatcher`, from just after the header up to (but not including) the
 * next section header or end of text. Empty string when the section is absent.
 */
export function extractSectionBody(text: string, headerMatcher: RegExp): string {
  const lines = text.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headerMatcher.test(lines[i].trim())) {
      start = i;
      break;
    }
  }
  if (start === -1) return '';

  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (isSectionHeader(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}
