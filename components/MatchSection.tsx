import { MetricBar } from './MetricBar';
import { KeywordPill } from './KeywordPill';

interface MatchSectionProps {
  matchScore: number;
  projAvg: number;
  formatScore: number;
  matched: string[];
  missing: string[];
}

export function MatchSection({
  matchScore,
  projAvg,
  formatScore,
  matched,
  missing,
}: MatchSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-serif text-[13px] text-ink-3 border-b-2 border-accent pb-[2px]">01</span>
        <h2 className="font-serif text-[28px] font-normal tracking-[-0.01em]">
          How well your resume matches the job
        </h2>
      </div>
      <p className="text-sm text-ink-3 mb-6 max-w-[540px]">
        The ATS looks for specific keywords from the job description. Here&apos;s where you stand.
      </p>

      <div>
        <MetricBar
          name="Keyword match"
          score={matchScore}
          label={`${matched.length} of ${matched.length + missing.length}`}
        />
        <MetricBar name="Project quality" score={projAvg} label={`${projAvg}/100`} />
        <MetricBar name="Format & sections" score={formatScore} label={`${formatScore}/100`} />
      </div>

      <div className="mt-6">
        <h4 className="text-[13px] font-medium text-ink-2 mb-2.5">Keywords you have</h4>
        <div className="flex flex-wrap gap-1.5">
          {matched.length ? (
            matched.map((k) => (
              <KeywordPill key={k} variant="matched">
                {k}
              </KeywordPill>
            ))
          ) : (
            <span className="text-[13px] text-ink-3">None of the job&apos;s keywords found yet.</span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-[13px] font-medium text-ink-2 mb-2.5">Keywords you&apos;re missing</h4>
        <div className="flex flex-wrap gap-1.5">
          {missing.length ? (
            missing.map((k) => (
              <KeywordPill key={k} variant="missing">
                {k}
              </KeywordPill>
            ))
          ) : (
            <span className="text-[13px] text-good">You&apos;ve got them all.</span>
          )}
        </div>
      </div>
    </div>
  );
}
