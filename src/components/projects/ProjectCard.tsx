import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../ui/StatusBadge'
import { TierBadge } from '../ui/TierBadge'
import type { Project } from '../../lib/types'

function timeAgo(ts: { toDate: () => Date } | null): string {
  if (!ts) return 'never'
  const diff = Date.now() - ts.toDate().getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()

  return (
    <div
      className="card-hover p-4 group"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-accent-hover transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {project.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-3 text-slate-400 border border-white/5"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span className="text-[10px] text-slate-600 self-center">
              +{project.techStack.length - 5}
            </span>
          )}
        </div>
      )}

      {project.nextAction && (
        <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-accent/5 border border-accent/10">
          <p className="text-[11px] text-accent-hover/80 leading-relaxed">
            <span className="font-medium text-accent/60 mr-1">→</span>
            {project.nextAction}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <TierBadge tier={project.priorityTier} />
        <div className="flex items-center gap-3">
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-600 hover:text-slate-300 transition-colors"
              title="GitHub"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-600 hover:text-slate-300 transition-colors"
              title="Live URL"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          <span className="text-[10px] text-slate-600">{timeAgo(project.lastUpdated)}</span>
        </div>
      </div>
    </div>
  )
}
