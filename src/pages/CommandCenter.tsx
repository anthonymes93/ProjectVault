import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCommandCenter } from '../hooks/useCommandCenter'
import { useApp } from '../contexts/AppContext'
import { ProjectCard } from '../components/projects/ProjectCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { Project, ProjectStatus, ProjectCounts } from '../lib/types'

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-surface-1 border border-white/5 rounded-xl p-4">
      <div className="h-7 w-10 bg-surface-3 rounded animate-pulse mb-2" />
      <div className="h-2.5 w-24 bg-surface-3/50 rounded animate-pulse" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-surface-1 border border-white/5 rounded-xl p-4">
      <div className="flex justify-between mb-2">
        <div className="h-4 w-2/5 bg-surface-3 rounded animate-pulse" />
        <div className="h-5 w-16 bg-surface-3/50 rounded animate-pulse" />
      </div>
      <div className="h-3 w-full bg-surface-3/40 rounded animate-pulse mb-1" />
      <div className="h-3 w-3/4 bg-surface-3/30 rounded animate-pulse mb-4" />
      <div className="flex gap-1.5 mb-4">
        {[40, 56, 32].map((w) => (
          <div key={w} className="h-4 bg-surface-3/30 rounded animate-pulse" style={{ width: w }} />
        ))}
      </div>
      <div className="border-t border-white/5 pt-3 flex justify-between">
        <div className="h-3 w-10 bg-surface-3/30 rounded animate-pulse" />
        <div className="h-3 w-12 bg-surface-3/30 rounded animate-pulse" />
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number | null
  color: string
  bg?: string
  to?: string
}

function StatCard({ label, value, color, bg = 'bg-surface-1', to }: StatCardProps) {
  const inner = (
    <div
      className={`${bg} border border-white/5 rounded-xl p-4 flex flex-col gap-1 transition-colors ${to ? 'hover:border-white/10 cursor-pointer' : ''}`}
    >
      {value === null ? (
        <div className="h-7 w-10 bg-surface-3 rounded animate-pulse" />
      ) : (
        <span className={`text-2xl font-semibold font-mono ${color}`}>{value}</span>
      )}
      <span className="text-[11px] text-slate-500 leading-tight">{label}</span>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

interface StatsGridProps {
  focused: Project[]
  counts: ProjectCounts | null
}

function StatsGrid({ focused, counts }: StatsGridProps) {
  const derived = useMemo(() => {
    const byStatus = (s: ProjectStatus) => focused.filter((p) => p.status === s).length
    const noNext = focused.filter((p) => !p.nextAction.trim()).length
    const noGithub = focused.filter((p) => !p.githubRepoUrl.trim()).length
    const noLive = focused.filter((p) => !p.liveUrl.trim()).length
    return { byStatus, noNext, noGithub, noLive }
  }, [focused])

  return (
    <div className="space-y-3 mb-8">
      <p className="section-title">Overview</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Projects" value={counts?.total ?? null} color="text-slate-200" to="/projects" />
        <StatCard label="Active" value={derived.byStatus('active')} color="text-success" to="/projects" />
        <StatCard label="Growth" value={derived.byStatus('growth')} color="text-accent-hover" to="/projects" />
        <StatCard label="Watch List" value={derived.byStatus('watchlist')} color="text-warning" to="/projects" />
        <StatCard label="Archived" value={counts?.archived ?? null} color="text-slate-500" to="/projects" />
      </div>

      <p className="section-title pt-1">
        Health Check{' '}
        <span className="text-slate-600 normal-case font-normal tracking-normal text-xs">
          — active, growth &amp; watch list
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Missing Next Action"
          value={derived.noNext}
          color={derived.noNext > 0 ? 'text-danger' : 'text-success'}
          bg={derived.noNext > 0 ? 'bg-danger/5' : 'bg-surface-1'}
          to="/projects"
        />
        <StatCard
          label="Missing GitHub URL"
          value={derived.noGithub}
          color={derived.noGithub > 0 ? 'text-warning' : 'text-success'}
          bg={derived.noGithub > 0 ? 'bg-warning/5' : 'bg-surface-1'}
          to="/projects"
        />
        <StatCard
          label="Missing Live URL"
          value={derived.noLive}
          color={derived.noLive > 0 ? 'text-slate-400' : 'text-success'}
          bg="bg-surface-1"
          to="/projects"
        />
      </div>
    </div>
  )
}

// ─── Needs Attention ──────────────────────────────────────────────────────────

interface AttentionReason {
  label: string
  color: string
}

function getAttentionReasons(p: Project): AttentionReason[] {
  const reasons: AttentionReason[] = []
  if (!p.nextAction.trim())
    reasons.push({ label: 'No next action', color: 'bg-danger/10 text-danger border-danger/20' })
  if (!p.githubRepoUrl.trim())
    reasons.push({ label: 'No GitHub URL', color: 'bg-warning/10 text-warning border-warning/20' })
  if (!p.liveUrl.trim())
    reasons.push({ label: 'No live URL', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' })
  if (p.lastOpened) {
    const days = Math.floor((Date.now() - p.lastOpened.toDate().getTime()) / 86400000)
    if (days >= 30)
      reasons.push({ label: `Dormant ${days}d`, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' })
  }
  return reasons
}

function AttentionCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const reasons = getAttentionReasons(project)
  return (
    <div
      className="card-hover p-3 flex flex-col gap-2"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-200 truncate">{project.name}</span>
        <StatusBadge status={project.status} />
      </div>
      <div className="flex flex-wrap gap-1">
        {reasons.map((r) => (
          <span key={r.label} className={`badge border text-[10px] ${r.color}`}>
            {r.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function NeedsAttention({ projects }: { projects: Project[] }) {
  const flagged = useMemo(
    () =>
      projects
        .filter((p) => ['active', 'growth'].includes(p.status))
        .filter((p) => getAttentionReasons(p).length > 0)
        .sort((a, b) => getAttentionReasons(b).length - getAttentionReasons(a).length),
    [projects]
  )
  if (flagged.length === 0) return null
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-200">Needs Attention</h2>
        <span className="text-xs font-mono text-danger">{flagged.length}</span>
        <span className="text-xs text-slate-600">active &amp; growth projects with gaps</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {flagged.map((p) => (
          <AttentionCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  )
}

// ─── Focus Section ────────────────────────────────────────────────────────────

function FocusSection({
  title,
  subtitle,
  status,
  projects,
  accentClass,
  loading,
}: {
  title: string
  subtitle: string
  status: ProjectStatus
  projects: Project[]
  accentClass: string
  loading: boolean
}) {
  const filtered = projects.filter((p) => p.status === status)
  if (!loading && filtered.length === 0) return null

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {!loading && <span className={`text-xs font-mono ${accentClass}`}>{filtered.length}</span>}
        <span className="text-xs text-slate-600">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading
          ? [1, 2, 3].map((i) => <CardSkeleton key={i} />)
          : filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  )
}

// ─── Error Display ────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  const isMissingEnv = message.includes('Missing Firebase')
  const isPermission = message.includes('permission') || message.includes('PERMISSION_DENIED')
  const isIndex = message.includes('index')

  return (
    <div className="card border-danger/20 bg-danger/5 p-6 max-w-xl">
      <div className="flex items-start gap-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-danger shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-medium text-danger mb-1">
            {isMissingEnv
              ? 'Firebase not configured'
              : isPermission
              ? 'Firestore permission denied'
              : isIndex
              ? 'Missing Firestore index'
              : 'Failed to load dashboard'}
          </p>
          <p className="text-xs text-slate-400 font-mono break-all mb-3">{message}</p>

          {isMissingEnv && (
            <div className="text-xs text-slate-500 space-y-1">
              <p>1. Copy <code className="bg-surface-3 px-1 rounded">.env.local.example</code> → <code className="bg-surface-3 px-1 rounded">.env.local</code></p>
              <p>2. Fill in your Firebase project credentials</p>
              <p>3. Restart the dev server</p>
            </div>
          )}
          {isPermission && (
            <p className="text-xs text-slate-500">
              Check your Firestore Security Rules. For development, allow read/write on the <code className="bg-surface-3 px-1 rounded">projects</code> collection.
            </p>
          )}
          {isIndex && (
            <div className="text-xs text-slate-500 space-y-1">
              <p>A composite index is required for the Command Center query.</p>
              <p>Run: <code className="bg-surface-3 px-1 rounded">firebase deploy --only firestore:indexes</code></p>
              <p>Or click the index link in your browser console.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CommandCenter() {
  const { focused, counts, loading, error } = useCommandCenter()
  const { openQuickAdd } = useApp()

  // Page shell always renders immediately — header is never blocked by loading state.
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? (
              <span className="inline-block h-3 w-48 bg-surface-3 rounded animate-pulse" />
            ) : error ? (
              'Failed to load'
            ) : (
              <>
                {focused.length} projects in focus
                {counts ? ` — ${counts.total} total in vault` : ''}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/import" className="btn-ghost text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </Link>
          <button onClick={openQuickAdd} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Quick Add
            <span className="text-[10px] text-white/40 font-mono ml-0.5">⌘⇧N</span>
          </button>
        </div>
      </div>

      {error ? (
        <ErrorBanner message={error} />
      ) : (
        <>
          {/* Stats — counts may arrive slightly after focused if counts query is slower */}
          {loading ? (
            <div className="space-y-3 mb-8">
              <p className="section-title">Overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => <StatSkeleton key={i} />)}
              </div>
              <p className="section-title pt-1">Health Check</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => <StatSkeleton key={i} />)}
              </div>
            </div>
          ) : (
            <StatsGrid focused={focused} counts={counts} />
          )}

          {/* Needs Attention — only renders when data is ready and there are flagged items */}
          {!loading && <NeedsAttention projects={focused} />}

          {/* Focus sections — show skeleton during load, real cards after */}
          <div className="space-y-10">
            <FocusSection
              title="Active"
              subtitle="Currently building"
              status="active"
              projects={focused}
              accentClass="text-success"
              loading={loading}
            />
            <FocusSection
              title="Growth"
              subtitle="Momentum building"
              status="growth"
              projects={focused}
              accentClass="text-accent-hover"
              loading={loading}
            />
            <FocusSection
              title="Watch List"
              subtitle="Keep an eye on"
              status="watchlist"
              projects={focused}
              accentClass="text-warning"
              loading={loading}
            />
          </div>

          {!loading && focused.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-slate-400 text-sm font-medium mb-1">Nothing in focus</p>
              <p className="text-slate-600 text-xs mb-4">
                Mark projects as Active, Growth, or Watch List to see them here.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/import" className="btn-ghost text-xs">Import batch</Link>
                <button onClick={openQuickAdd} className="btn-primary text-xs">Quick Add</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
