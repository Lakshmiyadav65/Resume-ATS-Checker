import { NextResponse } from 'next/server';
import { tailorResumeWithLLM } from '@/lib/llm/tailor-resume';
import { deterministicTailor } from '@/lib/analysis/tailor-fallback';
import { buildDocx } from '@/lib/docx/build';
import type { TailorRequest } from '@/types/tailored';

export const runtime = 'nodejs';

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
  const usedFallback = !llmTailored;

  const buffer = await buildDocx(tailored);

  const safeName = (tailored.name || 'resume').replace(/[^a-z0-9 _-]/gi, '').trim().replace(/\s+/g, '_') || 'resume';
  const filename = `${safeName}_tailored.docx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
      'X-Tailor-Mode': usedFallback ? 'fallback' : 'llm',
    },
  });
}
