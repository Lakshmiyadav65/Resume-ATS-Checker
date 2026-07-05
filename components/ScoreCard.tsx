import type { Verdict } from '@/types/analysis';
import { Pill, type PillTone } from './ui/Pill';

const VERDICT_COPY: Record<Verdict, { label: string; tone: PillTone; msg: string }> = {
  ready: {
    label: 'Ready to apply',
    tone: 'good',
    msg: 'Your resume should pass most ATS filters for this role. Polish the project bullets to push it higher.',
  },
  almost: {
    label: 'Almost there',
    tone: 'warn',
    msg: "You're close. The ATS may rank you below candidates with stronger keyword and project alignment.",
  },
  'needs-work': {
    label: 'Needs work',
    tone: 'bad',
    msg: 'Significant changes needed before submitting. Missing keywords and weak descriptions will likely filter you out.',
  },
};

export function ScoreCard({
  composite,
  verdict,
  unreliable = false,
}: {
  composite: number;
  verdict: Verdict;
  unreliable?: boolean;
}) {
  const copy = VERDICT_COPY[verdict];
  const gap = 80 - composite;

  return (
    <div className="bg-surface border border-line rounded-xl p-10 text-center mb-9">
      <div className="text-sm text-ink-3 mb-3">Your ATS score</div>
      <div
        className={[
          'font-serif font-normal leading-none tracking-[-0.04em] text-[72px] md:text-[96px]',
          unreliable ? 'text-ink-3 opacity-50' : '',
        ].join(' ')}
      >
        {composite}
        <sub className="text-2xl text-ink-3 align-baseline font-sans">/100</sub>
      </div>

      {unreliable ? (
        <>
          <Pill tone="neutral" className="mt-4">
            Not scored
          </Pill>
          <p className="mt-[14px] text-base text-ink-2 max-w-[480px] mx-auto">
            We can&apos;t give you a real score until the input above is fixed. This number reflects
            invalid input, not your resume.
          </p>
        </>
      ) : (
        <>
          <Pill tone={copy.tone} className="mt-4">
            {copy.label}
          </Pill>
          <p className="mt-[14px] text-base text-ink-2 max-w-[480px] mx-auto">{copy.msg}</p>
          <div className="mt-6 pt-6 border-t border-line text-[15px] text-ink-2">
            {gap > 0 ? (
              <>
                You need <strong className="text-accent-2 font-semibold">+{gap} points</strong> to
                clear the typical 80-point bar.
              </>
            ) : (
              <>
                You&apos;ve cleared the{' '}
                <strong className="text-accent-2 font-semibold">80-point</strong> bar most filters
                use.
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
