// Normalizes free-text so the same content scores identically regardless of
// where it came from (pasted vs. extracted from PDF/DOCX). Without this, CRLF
// line endings, trailing spaces, and extra blank lines from a file parser can
// shift section/project detection and produce a different score than a paste.
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n') // CRLF / lone CR -> LF
    .replace(/[^\S\n]+$/gm, '') // trailing spaces/tabs per line
    .replace(/\n{3,}/g, '\n\n') // collapse runs of blank lines
    .trim();
}
