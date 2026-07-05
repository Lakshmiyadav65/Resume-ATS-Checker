// Text sanitizers shared by the PDF and LaTeX exporters.
//
// Both targets choke on characters outside a narrow set:
//  - pdf-lib's StandardFonts use WinAnsi encoding; drawText THROWS on any
//    code point it can't encode (smart quotes, em dashes, arrows, emoji, CJK).
//  - pdflatex + inputenc(utf8) throws "Unicode character not set up for use
//    with LaTeX" on those same typographic characters.
// LLM output is full of them (curly quotes, en/em dashes, bullets), so we
// normalize first and, for hard safety, drop anything above Latin-1.
//
// Patterns are built via RegExp(string) with \\uXXXX escapes so this source
// file stays pure ASCII (no fragile invisible literals).

const g = (pattern: string) => new RegExp(pattern, 'g');

/** Replace common typographic Unicode with ASCII/LaTeX-safe equivalents. */
export function normalizeTypography(input: string): string {
  return input
    .replace(g('[\\u2018\\u2019\\u201A\\u201B]'), "'") // single quotes
    .replace(g('[\\u201C\\u201D\\u201E\\u201F]'), '"') // double quotes
    .replace(g('\\u2013'), '--') // en dash
    .replace(g('[\\u2014\\u2015]'), '---') // em dash
    .replace(g('[\\u2022\\u00B7\\u2023\\u25E6\\u2043\\u2219]'), '-') // bullets / middots
    .replace(g('\\u2026'), '...') // ellipsis
    .replace(g('[\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]'), ' ') // spaces
    .replace(g('[\\u200B\\u200C\\u200D\\uFEFF]'), '') // zero-width
    .replace(/\t/g, ' ')
    .replace(g('[\\u0000-\\u0008\\u000B-\\u001F\\u007F-\\u009F]'), ''); // controls (keep \n)
}

/**
 * Normalize, then drop anything above U+00FF so the result is guaranteed
 * encodable by both pdf-lib's WinAnsi fonts and pdflatex. Latin-1 still covers
 * the accented names people actually use (Jose, Francois, Muller).
 */
export function toLatin1Safe(input: string): string {
  return normalizeTypography(input).replace(g('[^\\u0000-\\u00FF]'), '');
}
