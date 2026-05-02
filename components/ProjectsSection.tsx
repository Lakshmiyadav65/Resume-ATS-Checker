import type { Project } from '@/types/analysis';
import { ProjectCard } from './ProjectCard';

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-serif text-[13px] text-ink-3 border-b-2 border-accent pb-[2px]">02</span>
        <h2 className="font-serif text-[28px] font-normal tracking-[-0.01em]">
          Your project descriptions
        </h2>
      </div>
      <p className="text-sm text-ink-3 mb-6 max-w-[540px]">
        Vague bullets like &quot;worked on&quot; or &quot;helped with&quot; hurt your score. Strong bullets show what you built and what changed because of it.
      </p>

      {projects.length ? (
        <div>
          {projects.map((p, i) => (
            <ProjectCard key={i} project={p} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-ink-3 p-4 bg-surface border border-line rounded-[10px]">
          No projects detected. Add a clear PROJECTS section with at least one project description.
        </div>
      )}
    </div>
  );
}
