import { NextResponse } from 'next/server';
import { runAnalysis } from '@/lib/analysis';
import { rewriteBullet } from '@/lib/llm/rewrite-bullet';
import type { AnalysisResult, AnalyzeRequest } from '@/types/analysis';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: AnalyzeRequest;
  try {
    body = (await req.json()) as AnalyzeRequest;
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

  const analysis = runAnalysis(resume, jd);

  const rewrites = await Promise.all(
    analysis.scoredProjects.map(async (p) => {
      if (p.score >= 80) {
        return { title: p.title, rewrite: '' };
      }
      const rewrite = await rewriteBullet({
        title: p.title,
        body: p.body,
        issues: p.issues,
        jdText: jd,
        detectedTech: p.detectedTech,
      });
      return { title: p.title, rewrite };
    }),
  );

  const result: AnalysisResult = {
    composite: analysis.composite,
    verdict: analysis.verdict,
    prediction: analysis.prediction,
    matchScore: analysis.matchScore,
    projAvg: analysis.projAvg,
    formatScore: analysis.formatScore,
    matched: analysis.matched,
    missing: analysis.missing,
    hasContact: analysis.hasContact,
    hasSections: analysis.hasSections,
    lifts: analysis.lifts,
    projects: analysis.projects.map((p) => {
      const r = rewrites.find((x) => x.title === p.title);
      return r && r.rewrite ? { ...p, rewrite: r.rewrite } : p;
    }),
  };

  return NextResponse.json(result);
}
