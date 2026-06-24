import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from '../components/projects/ProjectCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingScreen } from '../components/ui/Spinner'
import { STATUS_CONFIG, TIER_CONFIG } from '../lib/types'
import type { ProjectStatus, PriorityTier } from '../lib/types'

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[]
const ALL_TIERS = Object.keys(TIER_CONFIG) as PriorityTier[]

export function AllProjects() {
  const { projects, loading } = useProjects()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<PriorityTier | 'all'>('all')
  const [techFilter, setTechFilter] = useState('')

  const allTech = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.techStack.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.description.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (tierFilter !== 'all' && p.priorityTier !== tierFilter) return false
      if (techFilter && !p.techStack.some((t) => t.toLowerCase().includes(techFilter.toLowerCase()))) return false
      return true
    })
  }, [projects, search, statusFilter, tierFilter, techFilter])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: projects.length }
    ALL_STATUSES.forEach((s) => { map[s] = projects.filter((p) => p.status === s).length })
    return map
  }, [projects])

  if (loading) return <LoadingScreen />

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">All Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {projects.length} projects</p>
        </div>
        <button onClick={() => navigate('/projects/new')} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input pl-9"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-40"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as PriorityTier | 'all')}
          >
            <option value="all">All sizes</option>
            {ALL_TIERS.map((t) => (
              <option key={t} value={t}>{TIER_CONFIG[t].label}</option>
            ))}
          </select>
          <input
            className="input w-40"
            placeholder="Filter by tech..."
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            list="tech-list"
          />
          <datalist id="tech-list">
            {allTech.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-accent/15 text-accent-hover'
                : 'text-slate-500 hover:text-slate-300 hover:bg-surface-2'
            }`}
          >
            All <span className="text-slate-600 ml-1">{counts.all}</span>
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-accent/15 text-accent-hover'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface-2'
              }`}
            >
              {STATUS_CONFIG[s].label}
              <span className="text-slate-600 ml-1">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects match"
          description="Try adjusting your filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
