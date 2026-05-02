type Variant = 'matched' | 'missing' | 'plain';

const styles: Record<Variant, string> = {
  matched: 'bg-good-soft text-good border-transparent',
  missing: 'bg-bad-soft text-bad border-transparent',
  plain: 'bg-surface text-ink border-line',
};

export function KeywordPill({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={[
        'inline-block text-[13px] py-[5px] px-3 rounded-full border',
        styles[variant],
      ].join(' ')}
    >
      {variant === 'missing' ? <span className="opacity-70">+ </span> : null}
      {children}
    </span>
  );
}
