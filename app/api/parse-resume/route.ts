import { NextResponse } from 'next/server';
import { parsePdf } from '@/lib/parsing/pdf';
import { parseDocx } from '@/lib/parsing/docx';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: 'Expected multipart/form-data.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large. 5MB max.' }, { status: 413 });
  }

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
  const isDocx =
    name.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isPdf && !isDocx) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload a PDF or DOCX.' },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text = '';
  try {
    text = isPdf ? await parsePdf(buffer) : await parseDocx(buffer);
  } catch {
    return NextResponse.json(
      { error: 'Could not extract text from that file.' },
      { status: 422 },
    );
  }

  const cleaned = text.replace(/\r\n/g, '\n').trim();
  const looksGarbled =
    cleaned.length < 200 || !/(EDUCATION|PROJECTS|EXPERIENCE|SKILLS)/i.test(cleaned);

  return NextResponse.json({
    text: cleaned,
    ...(looksGarbled ? { warning: 'parser_garbled' as const } : {}),
  });
}
