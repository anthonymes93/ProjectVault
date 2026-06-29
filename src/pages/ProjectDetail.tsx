import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProject, deleteProject, touchProject } from '../lib/projects'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TierBadge } from '../components/ui/TierBadge'
import { LoadingScreen } from '../components/ui/Spinner'
import type { Project } from '../lib/types'

function ExternalLink({ href, label }: { href: string; label: string }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-accent-hover hover:text-accent transition-colors truncate"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      <span className="truncate">{label}</span>
    </a>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="section-title mb-3">{title}</p>
      {children}
    </div>
  )
}

function CopyPath({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(path)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-surface-2 px-3 py-2 rounded-lg border border-white/5 hover:border-accent/20 hover:text-slate-200 transition-all w-full text-left group"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-600 group-hover:text-accent-hover transition-colors">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span className="flex-1 truncate">{path}</span>
      <span className={`shrink-0 text-[10px] transition-colors ${copied ? 'text-success' : 'text-slate-600'}`}>
        {copied ? 'copied!' : 'click to copy'}
      </span>
    </button>
  )
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!id) return
    getProject(id).then((p) => {
      setProject(p)
      setLoading(false)
      if (p) touchProject(id)
    })
  }, [id])

  if (loading) return <LoadingScreen />
  if (!project) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-slate-400 text-sm">Project not found</p>
        <Link to="/projects" className="text-xs text-accent-hover mt-2 block">← Back to projects</Link>
      </div>
    </div>
  )

  const handleDelete = async () => {
    setDeleting(true)
    await deleteProject(project.id)
    navigate('/projects')
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            to="/projects"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 mb-3"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Projects
          </Link>
          <h1 className="text-2xl font-semibold text-slate-100">{project.name}</h1>
          {project.description && (
            <p className="text-slate-400 text-sm mt-1 max-w-xl">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <StatusBadge status={project.status} />
            <TierBadge tier={project.priorityTier} />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/projects/${project.id}/edit`} className="btn-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Link>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost text-danger/60 hover:text-danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sure?</span>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger text-xs px-3 py-1.5">
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost text-xs px-3 py-1.5">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-6">
          {project.nextAction && (
            <div className="card p-4 border-l-2 border-accent/60">
              <p className="section-title mb-2">Next Action</p>
              <p className="text-sm text-slate-200 leading-relaxed">{project.nextAction}</p>
            </div>
          )}

          {project.notes && (
            <Section title="Notes">
              <div className="card p-4">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{project.notes}</p>
              </div>
            </Section>
          )}

          {project.techStack.length > 0 && (
            <Section title="Tech Stack">
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-2 text-slate-300 border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {project.localFolderPath && (
            <Section title="Local Path">
              <CopyPath path={project.localFolderPath} />
            </Section>
          )}

          {project.githubRepoUrl && (
            <Section title="GitHub">
              <ExternalLink href={project.githubRepoUrl} label={project.githubRepoUrl.replace('https://github.com/', '')} />
            </Section>
          )}

          {project.liveUrl && (
            <Section title="Live URL">
              <ExternalLink href={project.liveUrl} label={project.liveUrl} />
            </Section>
          )}

          {project.firebaseUrl && (
            <Section title="Firebase">
              <ExternalLink href={project.firebaseUrl} label="Firebase Console" />
            </Section>
          )}

          {project.chatGptLinks.length > 0 && (
            <Section title="ChatGPT Conversations">
              <div className="space-y-1.5">
                {project.chatGptLinks.filter(Boolean).map((link, i) => (
                  <ExternalLink key={i} href={link} label={`Conversation ${i + 1}`} />
                ))}
              </div>
            </Section>
          )}

          {project.documentationLinks.length > 0 && (
            <Section title="Documentation">
              <div className="space-y-1.5">
                {project.documentationLinks.filter(Boolean).map((link, i) => (
                  <ExternalLink key={i} href={link} label={link} />
                ))}
              </div>
            </Section>
          )}

          <Section title="Timestamps">
            <div className="space-y-2">
              {[
                { label: 'Created', ts: project.createdAt },
                { label: 'Updated', ts: project.lastUpdated },
                { label: 'Opened', ts: project.lastOpened },
              ].map(({ label, ts }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-slate-400 font-mono">
                    {ts ? ts.toDate().toLocaleDateString() : '—'}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
