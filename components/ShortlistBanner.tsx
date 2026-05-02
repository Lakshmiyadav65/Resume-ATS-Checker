import type { Prediction, ShortlistOutcome } from '@/types/analysis';

interface Style {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  label: string;
  heading: string;
}

const STYLES: Record<ShortlistOutcome, Style> = {
  yes: {
    bg: 'bg-good-soft',
    border: 'border-good/30',
    iconBg: 'bg-good',
    iconColor: 'text-good',
    label: 'Likely shortlisted',
    heading: "You'd be shortlisted for this role",
  },
  borderline: {
    bg: 'bg-warn-soft',
    border: 'border-warn/30',
    iconBg: 'bg-warn',
    iconColor: 'text-warn',
    label: 'On the edge',
    heading: 'Could go either way',
  },
  no: {
    bg: 'bg-bad-soft',
    border: 'border-bad/30',
    iconBg: 'bg-bad',
    iconColor: 'text-bad',
    label: 'Unlikely to be shortlisted',
    heading: 'Unlikely to be shortlisted as-is',
  },
};

export function ShortlistBanner({ prediction }: { prediction: Prediction }) {
  const s = STYLES[prediction.outcome];

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'flex gap-4 items-start rounded-xl border p-5 mb-6',
        s.bg,
        s.border,
      ].join(' ')}
    >
      <div className={['flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white', s.iconBg].join(' ')}>
        <Icon outcome={prediction.outcome} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={['text-xs uppercase tracking-[0.08em] font-semibold', s.iconColor].join(' ')}>
            Shortlist prediction
          </span>
          <span className="text-xs text-ink-3">·</span>
          <span className={['text-xs uppercase tracking-[0.08em] font-semibold', s.iconColor].join(' ')}>
            {s.label}
          </span>
        </div>
        <h3 className="font-serif text-[22px] leading-tight mt-1 text-ink">{s.heading}</h3>
        <p className="text-[15px] text-ink-2 mt-2">
          <span className="font-semibold text-ink">Why:</span> {prediction.reason}
        </p>
        {prediction.outcome !== 'yes' && (
          <p className="text-sm text-ink-3 mt-2">
            Adjust your resume below — the prediction will update on your next check.
          </p>
        )}
      </div>
    </div>
  );
}

function Icon({ outcome }: { outcome: ShortlistOutcome }) {
  if (outcome === 'yes') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (outcome === 'no') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
