type Tone = 'good' | 'warn' | 'bad';

const fillTones: Record<Tone, string> = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
};

export function MetricBar({
  name,
  score,
  label,
}: {
  name: string;
  score: number;
  label: string;
}) {
  const tone: Tone = score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad';
  return (
    <div className="grid grid-cols-[130px_1fr_60px] sm:grid-cols-[200px_1fr_80px] gap-4 items-center py-[14px] border-b border-line-2 last:border-b-0 text-sm">
      <div className="text-ink">{name}</div>
      <div className="h-1 bg-line-2 rounded-full overflow-hidden">
        <div
          className={['h-full rounded-full transition-[width] duration-700 ease-out-expo', fillTones[tone]].join(' ')}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="text-[13px] text-ink-2 text-right tabular-nums">{label}</div>
    </div>
  );
}
