import { NextResponse } from 'next/server';
import { tailorResumeWithLLM } from '@/lib/llm/tailor-resume';
import { deterministicTailor } from '@/lib/analysis/tailor-fallback';
import { buildDocx } from '@/lib/docx/build';
import { buildPdf } from '@/lib/pdf/build';
import { buildLatex } from '@/lib/latex/build';
import { runAnalysis } from '@/lib/analysis';
import { normalizeText } from '@/lib/analysis/normalize';
import { tailoredToText, countPlaceholders } from '@/lib/tailor/serialize';
import type {
  TailorRequest,
  TailorResponse,
  TailorScore,
  TailoredResume,
} from '@/types/tailored';

export const runtime = 'nodejs';

function scoreOf(resumeText: string, jd: string): TailorScore {
  const a = runAnalysis(resumeText, jd);
  return {
    composite: a.composite,
    matchScore: a.matchScore,
    projAvg: a.projAvg,
    formatScore: a.formatScore,
    matchedCount: a.matched.length,
    missingCount: a.missing.length,
  };
}

/** Build one export format, isolating failures so one bad format doesn't sink
 *  the response or the other formats. */
async function safeBuild<T>(fn: () => Promise<T> | T): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function buildExports(tailored: TailoredResume): Promise<TailorResponse['exports']> {
  const [docxBase64, pdfBase64, latex] = await Promise.all([
    safeBuild(async () => (await buildDocx(tailored)).toString('base64')),
    safeBuild(async () => (await buildPdf(tailored)).toString('base64')),
    safeBuild(() => buildLatex(tailored)),
  ]);
  return { docxBase64, pdfBase64, latex };
}

export async function POST(req: Request) {
  let body: TailorRequest;
  try {
    body = (await req.json()) as TailorRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const resume = (body.resume || '').trim();
  const jd = (body.jd || '').trim();
  if (!resume || !jd) {
    return NextResponse.json(
      { error: 'Both resume and job description are required.' },
      { status: 400 },
    );
  }

  const llmTailored = await tailorResumeWithLLM({ resume, jd });
  const tailored = llmTailored ?? deterministicTailor({ resume, jd });
  const mode: 'llm' | 'fallback' = llmTailored ? 'llm' : 'fallback';

  const exports = await buildExports(tailored);

  const safeName =
    (tailored.name || 'resume').replace(/[^a-z0-9 _-]/gi, '').trim().replace(/\s+/g, '_') ||
    'resume';
  const filenameBase = `${safeName}_tailored`;

  // Re-score the tailored resume through the same analyzer the original ran
  // through, so the preview can show an honest projected before -> after.
  const jdNorm = normalizeText(jd);
  const before = scoreOf(normalizeText(resume), jdNorm);
  const after = scoreOf(normalizeText(tailoredToText(tailored)), jdNorm);

  const response: TailorResponse = {
    mode,
    tailored,
    filenameBase,
    exports,
    placeholders: countPlaceholders(tailored),
    before,
    after,
  };

  return NextResponse.json(response);
}
