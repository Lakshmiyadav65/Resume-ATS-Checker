import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
} from 'docx';
import type { TailoredResume } from '@/types/tailored';

function contactLine(c: TailoredResume['contact']): string {
  return [c.email, c.phone, c.location, c.github, c.linkedin, c.website]
    .filter((v): v is string => Boolean(v))
    .join(' | ');
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { color: '888888', size: 6, style: BorderStyle.SINGLE, space: 1 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        font: 'Calibri',
      }),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22, font: 'Calibri' })],
  });
}

function plain(text: string, opts: { bold?: boolean; italic?: boolean; size?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        italics: opts.italic,
        size: opts.size ?? 22,
        font: 'Calibri',
      }),
    ],
  });
}

export async function buildDocx(resume: TailoredResume): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: resume.name, bold: true, size: 32, font: 'Calibri' }),
      ],
    }),
  );

  const contact = contactLine(resume.contact);
  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contact, size: 20, font: 'Calibri', color: '4a4a4a' })],
      }),
    );
  }

  if (resume.summary) {
    children.push(sectionHeading('Summary'));
    children.push(plain(resume.summary, { italic: true }));
  }

  if (resume.skills.length) {
    children.push(sectionHeading('Skills'));
    children.push(plain(resume.skills.join(' · ')));
  }

  if (resume.education.length) {
    children.push(sectionHeading('Education'));
    for (const ed of resume.education) {
      const headerText = [ed.degree, ed.school].filter(Boolean).join(', ');
      const tail = ed.dates ? `   ${ed.dates}` : '';
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: headerText, bold: true, size: 22, font: 'Calibri' }),
            ...(tail
              ? [new TextRun({ text: tail, size: 22, font: 'Calibri', color: '888888' })]
              : []),
          ],
        }),
      );
      if (ed.details) children.push(plain(ed.details));
    }
  }

  if (resume.projects.length) {
    children.push(sectionHeading('Projects'));
    for (const p of resume.projects) {
      children.push(plain(p.title, { bold: true }));
      for (const b of p.bullets) children.push(bullet(b));
    }
  }

  if (resume.experience.length) {
    children.push(sectionHeading('Experience'));
    for (const x of resume.experience) {
      const head = [x.title, x.company].filter(Boolean).join(', ');
      const tail = x.dates ? `   ${x.dates}` : '';
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: head, bold: true, size: 22, font: 'Calibri' }),
            ...(tail
              ? [new TextRun({ text: tail, size: 22, font: 'Calibri', color: '888888' })]
              : []),
          ],
        }),
      );
      for (const b of x.bullets) children.push(bullet(b));
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
        heading1: { run: { font: 'Calibri', size: 22, bold: true } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
