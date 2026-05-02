import { NextResponse } from 'next/server';
import { rewriteBullet } from '@/lib/llm/rewrite-bullet';

export const runtime = 'nodejs';

interface RewriteRequest {
  title: string;
  body: string;
  issues: string[];
  jdText: string;
  detectedTech: string[];
}

export async function POST(req: Request) {
  let body: RewriteRequest;
  try {
    body = (await req.json()) as RewriteRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.title || !body.body) {
    return NextResponse.json(
      { error: 'title and body are required.' },
      { status: 400 },
    );
  }

  const rewrite = await rewriteBullet({
    title: body.title,
    body: body.body,
    issues: body.issues || [],
    jdText: body.jdText || '',
    detectedTech: body.detectedTech || [],
  });

  return NextResponse.json({ rewrite });
}
