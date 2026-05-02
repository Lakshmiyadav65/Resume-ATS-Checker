import type { ReactNode } from 'react';

export type PillTone = 'good' | 'warn' | 'bad' | 'neutral';

const tones: Record<PillTone, string> = {
  good: 'bg-good-soft text-good',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  neutral: 'bg-surface text-ink-2 border border-line',
};

export function Pill({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: PillTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        'inline-block px-[14px] py-[6px] rounded-full text-sm font-medium',
        tones[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
