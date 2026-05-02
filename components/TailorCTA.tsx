'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

interface TailorCTAProps {
  resume: string;
  jd: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; mode: 'llm' | 'fallback' }
  | { kind: 'error'; message: string };

export function TailorCTA({ resume, jd }: TailorCTAProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function tailor() {
    setStatus({ kind: 'loading' });
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not tailor your resume.');
      }

      const mode = res.headers.get('X-Tailor-Mode') === 'fallback' ? 'fallback' : 'llm';
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] || 'tailored_resume.docx';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus({ kind: 'done', mode });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setStatus({ kind: 'error', message: msg });
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 mb-9">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[24px] leading-tight text-ink">Tailor this resume to the job</h3>
          <p className="text-[15px] text-ink-2 mt-1">
            Generate a fresh resume rewritten around this job description — keywords woven in,
            project bullets in XYZ format, ready to download as DOCX.
          </p>
          {status.kind === 'done' && status.mode === 'fallback' && (
            <p className="text-sm text-warn mt-2">
              Generated with the deterministic tailorer (no <code className="text-xs">ANTHROPIC_API_KEY</code> set). For a fully LLM-rewritten version, add your key to <code className="text-xs">.env.local</code>.
            </p>
          )}
          {status.kind === 'done' && status.mode === 'llm' && (
            <p className="text-sm text-good mt-2">Downloaded — review the .docx and replace any [bracketed placeholders] with real numbers.</p>
          )}
          {status.kind === 'error' && (
            <p className="text-sm text-bad mt-2">{status.message}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button onClick={tailor} disabled={status.kind === 'loading'}>
            {status.kind === 'loading' ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Tailoring…
              </span>
            ) : status.kind === 'done' ? (
              'Tailor again'
            ) : (
              'Tailor & download .docx'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#e8b84a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
