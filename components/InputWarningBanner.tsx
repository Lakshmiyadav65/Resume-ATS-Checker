import type { InputWarning } from '@/types/analysis';

const LABELS: Record<InputWarning['kind'], string> = {
  'resume-is-job-description': 'Job description in the resume box',
  'not-a-resume': "Doesn't look like a resume",
};

export function InputWarningBanner({ warning }: { warning: InputWarning }) {
  return (
    <div
      role="alert"
      className="flex gap-4 items-start rounded-xl border p-5 mb-6 bg-bad-soft border-bad/30"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-bad">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.4" fill="currentColor" />
          <path
            d="M12 3l9 16H3L12 3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-[0.08em] font-semibold text-bad">
            Check your input
          </span>
          <span className="text-xs text-ink-3">·</span>
          <span className="text-xs uppercase tracking-[0.08em] font-semibold text-bad">
            {LABELS[warning.kind]}
          </span>
        </div>
        <h3 className="font-serif text-[22px] leading-tight mt-1 text-ink">
          The score below isn&apos;t reliable
        </h3>
        <p className="text-[15px] text-ink-2 mt-2">{warning.message}</p>
      </div>
    </div>
  );
}
