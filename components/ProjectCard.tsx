import type { Project } from '@/types/analysis';

export function ProjectCard({ project }: { project: Project }) {
  const tone = project.score >= 75 ? 'good' : project.score >= 50 ? 'warn' : 'bad';
  const pillTone = {
    good: 'bg-good-soft text-good',
    warn: 'bg-warn-soft text-warn',
    bad: 'bg-bad-soft text-bad',
  }[tone];

  return (
    <div className="bg-surface border border-line rounded-[10px] p-5 mb-3.5">
      <div className="flex justify-between items-center gap-3 mb-2.5">
        <div className="font-semibold text-[15px]">{project.title}</div>
        <span
          className={[
            'text-xs py-[3px] px-2.5 rounded-full font-medium flex-shrink-0',
            pillTone,
          ].join(' ')}
        >
          {project.score}/100
        </span>
      </div>

      <div className="text-[13px] text-ink-2 py-3 px-3.5 bg-bg rounded-md mt-2 mb-3 leading-[1.55]">
        {project.body}
      </div>

      {project.issues.length ? (
        <ul className="list-none p-0 mb-3.5">
          {project.issues.map((issue, i) => (
            <li
              key={i}
              className="text-[13px] text-ink-2 py-1 pl-[22px] relative before:content-['—'] before:absolute before:left-[4px] before:text-bad"
            >
              {issue}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-[13px] text-good my-1.5 mb-3">No issues detected.</div>
      )}

      {project.rewrite ? (
        <div className="bg-accent-soft border-l-[3px] border-accent rounded-lg py-3.5 px-4">
          <div className="text-[11px] uppercase tracking-[0.08em] text-accent-2 font-semibold mb-1.5">
            Suggested rewrite
          </div>
          <div className="text-sm text-ink leading-[1.55]">{project.rewrite}</div>
        </div>
      ) : null}
    </div>
  );
}
