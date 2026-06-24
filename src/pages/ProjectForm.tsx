import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { createProject, updateProject, getProject } from '../lib/projects'
import { LoadingScreen } from '../components/ui/Spinner'
import { STATUS_CONFIG, TIER_CONFIG } from '../lib/types'
import type { ProjectStatus, PriorityTier, ProjectInput } from '../lib/types'

const BLANK: Omit<ProjectInput, 'lastOpened'> = {
  name: '',
  description: '',
  localFolderPath: '',
  githubRepoUrl: '',
  liveUrl: '',
  chatGptLinks: [''],
  documentationLinks: [''],
  notes: '',
  techStack: [],
  nextAction: '',
  status: 'active',
  priorityTier: 'small',
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function LinkListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const update = (i: number, val: string) => {
    const next = [...values]
    next[i] = val
    onChange(next)
  }
  const add = () => onChange([...values, ''])
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i))

  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input"
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="px-2 py-2 text-slate-600 hover:text-danger transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="text-xs text-slate-500 hover:text-accent-hover transition-colors flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add link
        </button>
      </div>
    </div>
  )
}

function TechStackField({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInput('')
  }

  const remove = (tech: string) => onChange(values.filter((t) => t !== tech))

  return (
    <div>
      <label className="label">Tech Stack</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-8">
        {values.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => remove(tech)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-surface-3 text-slate-300 border border-white/10 hover:border-danger/30 hover:text-danger/80 transition-colors"
          >
            {tech}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="React, TypeScript, Tailwind… (Enter to add)"
        />
        <button type="button" onClick={add} className="btn-ghost shrink-0">Add</button>
      </div>
    </div>
  )
}

export function ProjectForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<typeof BLANK>(BLANK)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getProject(id).then((p) => {
      if (p) {
        setForm({
          name: p.name,
          description: p.description,
          localFolderPath: p.localFolderPath,
          githubRepoUrl: p.githubRepoUrl,
          liveUrl: p.liveUrl,
          chatGptLinks: p.chatGptLinks.length ? p.chatGptLinks : [''],
          documentationLinks: p.documentationLinks.length ? p.documentationLinks : [''],
          notes: p.notes,
          techStack: p.techStack,
          nextAction: p.nextAction,
          status: p.status,
          priorityTier: p.priorityTier,
        })
      }
      setLoading(false)
    })
  }, [id])

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const input: ProjectInput = {
        ...form,
        chatGptLinks: form.chatGptLinks.filter(Boolean),
        documentationLinks: form.documentationLinks.filter(Boolean),
        lastOpened: null,
      }
      if (isEdit && id) {
        await updateProject(id, input)
        navigate(`/projects/${id}`)
      } else {
        const newId = await createProject(input)
        navigate(`/projects/${newId}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          to={isEdit && id ? `/projects/${id}` : '/projects'}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 mb-3"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {isEdit ? 'Back to project' : 'All Projects'}
        </Link>
        <h1 className="text-xl font-semibold text-slate-100">
          {isEdit ? 'Edit Project' : 'New Project'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core */}
        <div className="card p-6 space-y-5">
          <p className="section-title">Core Info</p>

          <FieldRow label="Project Name *">
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="My Awesome Project"
              autoFocus
            />
          </FieldRow>

          <FieldRow label="Description">
            <textarea
              className="textarea"
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What does this project do?"
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => set('status', e.target.value as ProjectStatus)}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </FieldRow>

            <FieldRow label="Priority Tier">
              <select
                className="input"
                value={form.priorityTier}
                onChange={(e) => set('priorityTier', e.target.value as PriorityTier)}
              >
                {Object.entries(TIER_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </FieldRow>
          </div>

          <FieldRow label="Next Action">
            <input
              className="input"
              value={form.nextAction}
              onChange={(e) => set('nextAction', e.target.value)}
              placeholder="What's the immediate next step?"
            />
          </FieldRow>
        </div>

        {/* Links */}
        <div className="card p-6 space-y-5">
          <p className="section-title">Links & Paths</p>

          <FieldRow label="Local Folder Path">
            <input
              className="input font-mono text-xs"
              value={form.localFolderPath}
              onChange={(e) => set('localFolderPath', e.target.value)}
              placeholder="/home/anthony/Projects/MyProject"
            />
          </FieldRow>

          <FieldRow label="GitHub Repository URL">
            <input
              className="input"
              value={form.githubRepoUrl}
              onChange={(e) => set('githubRepoUrl', e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </FieldRow>

          <FieldRow label="Live URL">
            <input
              className="input"
              value={form.liveUrl}
              onChange={(e) => set('liveUrl', e.target.value)}
              placeholder="https://myproject.vercel.app"
            />
          </FieldRow>

          <LinkListField
            label="ChatGPT Conversation Links"
            values={form.chatGptLinks}
            onChange={(v) => set('chatGptLinks', v)}
            placeholder="https://chat.openai.com/c/..."
          />

          <LinkListField
            label="Documentation Links"
            values={form.documentationLinks}
            onChange={(v) => set('documentationLinks', v)}
            placeholder="https://docs.example.com"
          />
        </div>

        {/* Tech & Notes */}
        <div className="card p-6 space-y-5">
          <p className="section-title">Tech & Notes</p>

          <TechStackField values={form.techStack} onChange={(v) => set('techStack', v)} />

          <FieldRow label="Notes">
            <textarea
              className="textarea"
              rows={5}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Architecture decisions, gotchas, context..."
            />
          </FieldRow>
        </div>

        {error && (
          <p className="text-danger text-sm">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            to={isEdit && id ? `/projects/${id}` : '/projects'}
            className="btn-ghost"
          >
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary min-w-28">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
