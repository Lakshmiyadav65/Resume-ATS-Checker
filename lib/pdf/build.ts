import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { TailoredResume } from '@/types/tailored';
import { toLatin1Safe } from '@/lib/text/sanitize';

// US Letter in points.
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54; // 0.75in
const INK = rgb(0.1, 0.1, 0.1);
const GRAY = rgb(0.53, 0.53, 0.53);
const RULE = rgb(0.72, 0.71, 0.68);

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
}

/**
 * Lay out a TailoredResume as a PDF using pdf-lib. Pure JS + embedded standard
 * fonts (no filesystem font reads), so it works identically in local dev and
 * on serverless. A running text cursor flows down the page and adds pages as
 * needed; long lines wrap by measuring glyph widths.
 */
export async function buildPdf(resume: TailoredResume): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  const layout = new Layout(doc, fonts);

  // Header: centered name + contact line. Fallback applied AFTER sanitizing so
  // an all-non-Latin-1 name isn't stripped to empty behind a truthy `||`.
  layout.centered(toLatin1Safe(resume.name) || 'Your Name', fonts.bold, 20, INK);
  const c = resume.contact;
  const contact = [c.email, c.phone, c.location, c.github, c.linkedin, c.website]
    .filter((v): v is string => Boolean(v))
    .join('   |   ');
  if (contact) {
    layout.gap(2);
    layout.centered(contact, fonts.regular, 9, GRAY);
  }
  layout.gap(6);

  if (resume.summary) {
    layout.section('Summary');
    layout.paragraph(resume.summary, fonts.italic, 10);
  }

  if (resume.skills.length) {
    layout.section('Skills');
    layout.paragraph(resume.skills.join('  ·  '), fonts.regular, 10);
  }

  if (resume.education.length) {
    layout.section('Education');
    for (const ed of resume.education) {
      const head = [ed.degree, ed.school].filter(Boolean).join(', ');
      layout.headline(head, ed.dates);
      if (ed.details) layout.paragraph(ed.details, fonts.regular, 10);
    }
  }

  if (resume.projects.length) {
    layout.section('Projects');
    for (const p of resume.projects) {
      layout.headline(toLatin1Safe(p.title) || 'Project');
      for (const b of p.bullets) layout.bullet(b);
      layout.gap(2);
    }
  }

  if (resume.experience.length) {
    layout.section('Experience');
    for (const x of resume.experience) {
      const head = [x.title, x.company].filter(Boolean).join(', ');
      layout.headline(head, x.dates);
      for (const b of x.bullets) layout.bullet(b);
      layout.gap(2);
    }
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

/** Stateful downward-flowing text layout with word wrap and page breaks. */
class Layout {
  private page: PDFPage;
  private y: number;
  private readonly maxWidth = PAGE_W - MARGIN * 2;

  constructor(
    private readonly doc: PDFDocument,
    private readonly fonts: Fonts,
  ) {
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN;
  }

  gap(h: number) {
    this.y -= h;
  }

  private ensure(h: number) {
    if (this.y - h < MARGIN) {
      this.page = this.doc.addPage([PAGE_W, PAGE_H]);
      this.y = PAGE_H - MARGIN;
    }
  }

  private lineHeight(size: number) {
    return size * 1.32;
  }

  centered(text: string, font: PDFFont, size: number, color = INK) {
    for (const line of wrap(text, font, size, this.maxWidth)) {
      const w = font.widthOfTextAtSize(line, size);
      this.ensure(this.lineHeight(size));
      this.page.drawText(line, {
        x: MARGIN + (this.maxWidth - w) / 2,
        y: this.y - size,
        size,
        font,
        color,
      });
      this.y -= this.lineHeight(size);
    }
  }

  section(title: string) {
    this.gap(8);
    const size = 11;
    this.ensure(this.lineHeight(size) + 6);
    this.page.drawText(toLatin1Safe(title).toUpperCase(), {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.fonts.bold,
      color: INK,
    });
    this.y -= this.lineHeight(size);
    // underline rule
    this.page.drawLine({
      start: { x: MARGIN, y: this.y + 2 },
      end: { x: PAGE_W - MARGIN, y: this.y + 2 },
      thickness: 0.75,
      color: RULE,
    });
    this.y -= 5;
  }

  /** Bold headline with an optional right-aligned meta (dates). Wraps like
   *  paragraph()/bullet() and reserves room for the meta on the first line so a
   *  long "Title, Company" neither overlaps the date nor runs off the page. */
  headline(text: string, meta?: string) {
    const size = 10.5;
    const metaSize = 9;
    const safeMeta = meta ? toLatin1Safe(meta) : '';
    const metaW = safeMeta ? this.fonts.regular.widthOfTextAtSize(safeMeta, metaSize) : 0;
    // First (and every) line leaves room for the right-aligned meta.
    const textMax = Math.max(this.maxWidth - (metaW ? metaW + 12 : 0), 40);
    const lines = wrap(text, this.fonts.bold, size, textMax);

    lines.forEach((line, i) => {
      this.ensure(this.lineHeight(size));
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y - size,
        size,
        font: this.fonts.bold,
        color: INK,
      });
      if (i === 0 && safeMeta) {
        this.page.drawText(safeMeta, {
          x: PAGE_W - MARGIN - metaW,
          y: this.y - size,
          size: metaSize,
          font: this.fonts.regular,
          color: GRAY,
        });
      }
      this.y -= this.lineHeight(size);
    });
  }

  paragraph(text: string, font: PDFFont, size: number, color = INK, indent = 0) {
    for (const line of wrap(text, font, size, this.maxWidth - indent)) {
      this.ensure(this.lineHeight(size));
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color,
      });
      this.y -= this.lineHeight(size);
    }
  }

  bullet(text: string) {
    const size = 10;
    const bulletIndent = 12;
    const lines = wrap(text, this.fonts.regular, size, this.maxWidth - bulletIndent);
    lines.forEach((line, i) => {
      this.ensure(this.lineHeight(size));
      if (i === 0) {
        this.page.drawText('•', {
          x: MARGIN,
          y: this.y - size,
          size,
          font: this.fonts.regular,
          color: GRAY,
        });
      }
      this.page.drawText(line, {
        x: MARGIN + bulletIndent,
        y: this.y - size,
        size,
        font: this.fonts.regular,
        color: INK,
      });
      this.y -= this.lineHeight(size);
    });
  }
}

/** Greedy word-wrap: break `text` into lines that fit `maxWidth` at `size`.
 *  Sanitizes to Latin-1 first so pdf-lib's WinAnsi fonts never throw. A single
 *  token wider than the line (e.g. a long URL) is hard-broken by character —
 *  whether it starts the line or arrives mid-line. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const widthOf = (s: string) => font.widthOfTextAtSize(s, size);

  // Split an unbreakable token into character chunks that each fit maxWidth.
  const hardBreak = (word: string): string[] => {
    const chunks: string[] = [];
    let chunk = '';
    for (const ch of word) {
      if (chunk && widthOf(chunk + ch) > maxWidth) {
        chunks.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    if (chunk) chunks.push(chunk);
    return chunks;
  };

  const words = toLatin1Safe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (widthOf(candidate) <= maxWidth) {
      line = candidate;
      continue;
    }
    // candidate overflows: flush the current line, then place `word`.
    if (line) {
      lines.push(line);
      line = '';
    }
    if (widthOf(word) > maxWidth) {
      const chunks = hardBreak(word);
      for (let i = 0; i < chunks.length - 1; i++) lines.push(chunks[i]);
      line = chunks[chunks.length - 1] ?? '';
    } else {
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}
