'use client';

import { useState, type ReactNode } from 'react';
import { Button } from './ui/Button';
import type { TailoredResume, TailorResponse, TailorScore } from '@/types/tailored';

interface TailorCTAProps {
  resume: string;
  jd: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; data: TailorResponse }
  | { kind: 'error'; message: string };

const TIMEOUT_MS = 90_000;

export function TailorCTA({ resume, jd }: TailorCTAProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function tailor() {
    setStatus({ kind: 'loading' });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Could not tailor your resume.');
      }
      const data = (await res.json()) as TailorResponse;
      setStatus({ kind: 'done', data });
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      const message = aborted
        ? 'Tailoring timed out — please try again.'
        : e instanceof Error
          ? e.message
          : 'Something went wrong.';
      setStatus({ kind: 'error', message });
    } finally {
      clearTimeout(timer);
    }
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke on a later tick: the download fetch runs asynchronously after
    // click(), so revoking synchronously can abort it (Firefox / older Chromium).
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  function base64ToBuffer(b64: string): ArrayBuffer {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer as ArrayBuffer;
  }

  function downloadDocx() {
    if (status.kind !== 'done' || !status.data.exports.docxBase64) return;
    triggerDownload(
      new Blob([base64ToBuffer(status.data.exports.docxBase64)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
      `${status.data.filenameBase}.docx`,
    );
  }

  function downloadPdf() {
    if (status.kind !== 'done' || !status.data.exports.pdfBase64) return;
    triggerDownload(
      new Blob([base64ToBuffer(status.data.exports.pdfBase64)], { type: 'application/pdf' }),
      `${status.data.filenameBase}.pdf`,
    );
  }

  function downloadTex() {
    if (status.kind !== 'done' || !status.data.exports.latex) return;
    triggerDownload(
      new Blob([status.data.exports.latex], { type: 'application/x-tex' }),
      `${status.data.filenameBase}.tex`,
    );
  }

  // Open a new Overleaf project prefilled with the LaTeX. Must be a real form
  // POST (Overleaf blocks cross-origin fetch) submitted synchronously in the
  // click handler so the popup blocker allows the new tab.
  function openInOverleaf() {
    if (status.kind !== 'done' || !status.data.exports.latex) return;
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    form.style.display = 'none';

    const snip = document.createElement('input');
    snip.type = 'hidden';
    snip.name = 'encoded_snip';
    snip.value = encodeURIComponent(status.data.exports.latex);
    form.appendChild(snip);

    const engine = document.createElement('input');
    engine.type = 'hidden';
    engine.name = 'engine';
    engine.value = 'pdflatex';
    form.appendChild(engine);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 mb-9">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[24px] leading-tight text-ink">Tailor this resume to the job</h3>
          <p className="text-[15px] text-ink-2 mt-1">
            Generate a fresh resume rewritten around this job description — keywords woven in,
            project bullets in XYZ format. Preview it and see your projected score before you download.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={tailor}
            disabled={status.kind === 'loading'}
            variant={status.kind === 'done' ? 'ghost' : 'primary'}
          >
            {status.kind === 'loading' ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Tailoring…
              </span>
            ) : status.kind === 'done' ? (
              'Re-tailor'
            ) : (
              'Tailor my resume'
            )}
          </Button>
        </div>
      </div>

      <div aria-live="polite">
        {status.kind === 'error' && (
          <p role="status" className="text-sm text-bad mt-3">
            {status.message}
          </p>
        )}

        {status.kind === 'done' && (
          <div className="mt-5 animate-fadeUp">
            <ScoreDelta before={status.data.before} after={status.data.after} />

            <TailoredPreview resume={status.data.tailored} />

            <div className="mt-5">
              <div className="text-sm text-ink-2 mb-2">Download as</div>
              <div className="flex flex-wrap items-center gap-3">
                {status.data.exports.docxBase64 && (
                  <Button onClick={downloadDocx}>Word (.docx)</Button>
                )}
                {status.data.exports.pdfBase64 && (
                  <Button onClick={downloadPdf} variant="ghost">
                    PDF
                  </Button>
                )}
                {status.data.exports.latex && (
                  <>
                    <Button onClick={openInOverleaf} variant="ghost">
                      Open in Overleaf
                    </Button>
                    <button
                      onClick={downloadTex}
                      className="text-sm text-ink-3 underline underline-offset-2 decoration-line hover:text-ink"
                    >
                      .tex
                    </button>
                  </>
                )}
              </div>
              {status.data.placeholders > 0 && (
                <p className="text-sm text-warn mt-3">
                  {status.data.placeholders}{' '}
                  {status.data.placeholders === 1 ? 'placeholder' : 'placeholders'} to fill in —
                  highlighted above.
                </p>
              )}
            </div>

            {status.data.mode === 'fallback' && (
              <p className="text-sm text-warn mt-3">
                Generated with the deterministic tailorer (no{' '}
                <code className="text-xs">GROQ_API_KEY</code> set). Add your key to{' '}
                <code className="text-xs">.env.local</code> for a fully LLM-rewritten version.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreDelta({ before, after }: { before: TailorScore; after: TailorScore }) {
  return (
    <div className="rounded-lg border border-line bg-bg p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm text-ink-2">Projected ATS score</span>
        <span className="text-[26px] leading-none text-ink-3 tabular-nums">{before.composite}</span>
        <span className="text-ink-3">&rarr;</span>
        <span className="font-serif text-[34px] leading-none text-ink tabular-nums">
          {after.composite}
        </span>
        <Delta from={before.composite} to={after.composite} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <SubScore label="Keywords" before={before.matchScore} after={after.matchScore} />
        <SubScore label="Projects" before={before.projAvg} after={after.projAvg} />
        <SubScore label="Format" before={before.formatScore} after={after.formatScore} />
      </div>

      <p className="text-xs text-ink-3 mt-3">
        Projected by re-scoring the tailored resume against this job. Real ATS results still vary.
      </p>
    </div>
  );
}

function SubScore({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-sm text-ink-3 tabular-nums">{before}</span>
        <span className="text-ink-3 text-xs">&rarr;</span>
        <span className="text-base text-ink tabular-nums">{after}</span>
        <Delta from={before} to={after} small />
      </div>
    </div>
  );
}

function Delta({ from, to, small = false }: { from: number; to: number; small?: boolean }) {
  const d = to - from;
  if (d === 0) return null;
  const cls = d > 0 ? 'text-good' : 'text-bad';
  return (
    <span className={`${small ? 'text-xs' : 'text-sm font-medium'} ${cls} tabular-nums`}>
      {d > 0 ? `+${d}` : d}
    </span>
  );
}

function TailoredPreview({ resume }: { resume: TailoredResume }) {
  const c = resume.contact;
  const contact = [c.email, c.phone, c.location, c.github, c.linkedin, c.website]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <div className="mt-4 rounded-lg border border-line bg-bg p-5 max-h-[440px] overflow-y-auto">
      <div className="text-center">
        <div className="font-serif text-[22px] leading-tight text-ink">{resume.name}</div>
        {contact && <div className="text-xs text-ink-3 mt-1 break-words">{contact}</div>}
      </div>

      {resume.summary && (
        <PreviewSection title="Summary">
          <p className="text-[13px] italic leading-relaxed text-ink-2">
            {withPlaceholders(resume.summary)}
          </p>
        </PreviewSection>
      )}

      {resume.skills.length > 0 && (
        <PreviewSection title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <span
                key={i}
                className="text-xs text-ink-2 bg-surface border border-line rounded-full px-2.5 py-1"
              >
                {s}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {resume.education.length > 0 && (
        <PreviewSection title="Education">
          {resume.education.map((ed, i) => (
            <div key={i} className="mb-1.5 last:mb-0">
              <div className="text-[13px] font-medium text-ink">
                {[ed.degree, ed.school].filter(Boolean).join(', ')}
                {ed.dates && <span className="font-normal text-ink-3"> · {ed.dates}</span>}
              </div>
              {ed.details && <div className="text-[13px] text-ink-2">{ed.details}</div>}
            </div>
          ))}
        </PreviewSection>
      )}

      {resume.projects.length > 0 && (
        <PreviewSection title="Projects">
          {resume.projects.map((p, i) => (
            <BulletBlock key={i} title={p.title} bullets={p.bullets} />
          ))}
        </PreviewSection>
      )}

      {resume.experience.length > 0 && (
        <PreviewSection title="Experience">
          {resume.experience.map((x, i) => (
            <BulletBlock
              key={i}
              title={[x.title, x.company].filter(Boolean).join(', ')}
              meta={x.dates}
              bullets={x.bullets}
            />
          ))}
        </PreviewSection>
      )}
    </div>
  );
}

function BulletBlock({
  title,
  meta,
  bullets,
}: {
  title: string;
  meta?: string;
  bullets: string[];
}) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="text-[13px] font-medium text-ink">
        {title}
        {meta && <span className="font-normal text-ink-3"> · {meta}</span>}
      </div>
      <ul className="mt-1 space-y-1">
        {bullets.map((b, j) => (
          <li key={j} className="relative pl-4 text-[13px] leading-relaxed text-ink-2">
            <span className="absolute left-0 text-ink-3">•</span>
            {withPlaceholders(b)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-2 border-b border-line pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {title}
      </div>
      {children}
    </div>
  );
}

/** Render text with any `[bracketed placeholder]` visually highlighted. */
function withPlaceholders(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark
        key={i}
        className="rounded bg-warn-soft px-1 py-0.5 not-italic text-warn"
        title="Fill this in with a real number"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#e8b84a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
