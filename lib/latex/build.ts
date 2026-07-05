import type { TailoredResume } from '@/types/tailored';
import { toLatin1Safe } from '@/lib/text/sanitize';

/**
 * Escape arbitrary text for LaTeX. Single-pass over the ORIGINAL string so that
 * replacement text (which itself contains `{`, `}`, `\`) is never re-escaped —
 * a naive sequential str.replace() chain double-escapes and breaks compilation.
 * Covers all ten LaTeX special characters.
 */
export function escapeLatex(input: string): string {
  const map: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    $: '\\$',
    '&': '\\&',
    '#': '\\#',
    '%': '\\%',
    _: '\\_',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  };
  return input.replace(/[\\{}$&#%_~^]/g, (ch) => map[ch]);
}

/** Normalize exotic Unicode (which pdflatex can't set up) then LaTeX-escape. */
function tex(s: string): string {
  return escapeLatex(toLatin1Safe(s));
}

/** \item content. Strips leading whitespace (meaningless in a bullet) then
 *  guards a leading `[` from being parsed as \item's optional-argument label —
 *  \item's \@ifnextchar skips spaces before testing for `[`. */
function item(text: string): string {
  const esc = tex(text).replace(/^\s+/, '');
  return `  \\item ${esc.startsWith('[') ? '{}' : ''}${esc}`;
}

/** Bold headline with optional right-aligned meta. Inputs must already be
 *  tex()-escaped (so callers can apply a fallback AFTER sanitizing). */
function headlineSafe(safeTitle: string, safeMeta?: string): string {
  const t = `\\textbf{${safeTitle}}`;
  return safeMeta ? `${t}\\hfill{\\small ${safeMeta}}\\par` : `${t}\\par`;
}

/**
 * Render a TailoredResume as a self-contained .tex document. Uses only packages
 * bundled with Overleaf / TeX Live default, so it compiles with pdflatex out of
 * the box. Empty sections are omitted.
 */
export function buildLatex(resume: TailoredResume): string {
  const c = resume.contact;
  const contact = [c.email, c.phone, c.location, c.github, c.linkedin, c.website]
    .filter((v): v is string => Boolean(v))
    .map((v) => tex(v))
    .join(' \\quad ');

  // Fallback applied AFTER sanitizing, so an all-non-Latin-1 name doesn't slip
  // past the `||` (truthy raw string) and then get stripped to empty.
  const name = tex(resume.name) || 'Your Name';

  const parts: string[] = [];

  parts.push(String.raw`\documentclass[11pt,letterpaper]{article}
\usepackage[margin=0.75in]{geometry}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage{textcomp}
\usepackage{parskip}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}

\setlist[itemize]{leftmargin=1.4em, topsep=2pt, itemsep=1pt, parsep=0pt}
\titleformat{\section}{\large\bfseries\scshape}{}{0em}{}[{\titlerule[0.8pt]}]
\titlespacing*{\section}{0pt}{8pt}{4pt}
\pagestyle{empty}
\setlength{\parindent}{0pt}

\begin{document}
`);

  parts.push(`\\begin{center}
  {\\LARGE \\textbf{${name}}}${contact ? `\\\\[3pt]\n  {\\small ${contact}}` : ''}
\\end{center}
\\vspace{2pt}
`);

  if (resume.summary) {
    parts.push(`\\section{Summary}\n${tex(resume.summary)}\n`);
  }

  if (resume.skills.length) {
    parts.push(`\\section{Skills}\n${resume.skills.map((s) => tex(s)).join(' $\\cdot$ ')}\n`);
  }

  if (resume.education.length) {
    const body = resume.education
      .map((ed) => {
        const head = headlineSafe(
          tex([ed.degree, ed.school].filter(Boolean).join(', ')),
          ed.dates ? tex(ed.dates) : undefined,
        );
        return ed.details ? `${head}\n${tex(ed.details)}\\par` : head;
      })
      .join('\n\\vspace{2pt}\n');
    parts.push(`\\section{Education}\n${body}\n`);
  }

  if (resume.projects.length) {
    const body = resume.projects
      .map((p) => {
        const head = headlineSafe(tex(p.title) || 'Project');
        if (!p.bullets.length) return head;
        return `${head}\n\\begin{itemize}\n${p.bullets.map(item).join('\n')}\n\\end{itemize}`;
      })
      .join('\n\\vspace{2pt}\n');
    parts.push(`\\section{Projects}\n${body}\n`);
  }

  if (resume.experience.length) {
    const body = resume.experience
      .map((x) => {
        const head = headlineSafe(
          tex([x.title, x.company].filter(Boolean).join(', ')),
          x.dates ? tex(x.dates) : undefined,
        );
        if (!x.bullets.length) return head;
        return `${head}\n\\begin{itemize}\n${x.bullets.map(item).join('\n')}\n\\end{itemize}`;
      })
      .join('\n\\vspace{2pt}\n');
    parts.push(`\\section{Experience}\n${body}\n`);
  }

  parts.push(`\n\\end{document}\n`);
  return parts.join('\n');
}
