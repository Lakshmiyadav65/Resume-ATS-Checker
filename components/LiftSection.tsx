import type { Lift } from '@/types/analysis';

function renderInlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    if (match) {
      return (
        <strong key={i} className="font-semibold">
          {match[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function LiftSection({ lifts }: { lifts: Lift[] }) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-serif text-sm text-ink-3 border-b-2 border-accent pb-[2px]">03</span>
        <h2 className="font-serif text-[30px] font-normal tracking-[-0.01em]">
          What to fix to clear the bar
        </h2>
      </div>
      <p className="text-[15px] text-ink-3 mb-6 max-w-[540px]">
        Each change below estimates how many points it should add to your score.
      </p>

      <div className="border-t border-line-2">
        {lifts.map((l, i) => (
          <div
            key={i}
            className="flex justify-between gap-5 py-[18px] border-b border-line-2 items-start hover:bg-line-2/40 transition-colors"
          >
            <div className="flex-1 text-[15px]">
              {renderInlineMd(l.desc)}
              <small className="block text-sm text-ink-3 mt-1">{l.sub}</small>
            </div>
            <div className="text-[15px] font-semibold text-accent-2 whitespace-nowrap tabular-nums">
              +{l.gain}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
