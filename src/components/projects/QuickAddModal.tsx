import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { createProject } from '../../lib/projects'
import { STATUS_CONFIG, TIER_CONFIG } from '../../lib/types'
import type { ProjectStatus, PriorityTier } from '../../lib/types'

const BLANK = {
  name: '',
  status: 'active' as ProjectStatus,
  priorityTier: 'small' as PriorityTier,
  nextAction: '',
  localFolderPath: '',
  githubRepoUrl: '',
  liveUrl: '',
  techInput: '',
  techStack: [] as string[],
}

export function QuickAddModal() {
  const { quickAddOpen, closeQuickAdd, refreshProjects } = useApp()
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (quickAddOpen) {
      setForm(BLANK)
      setError('')
      setSavedCount(0)
      setSaving(false)
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [quickAddOpen])

  if (!quickAddOpen) return null

  const set = <K extends keyof typeof BLANK>(k: K, v: (typeof BLANK)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const commitTech = () => {
    const tags = form.techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !form.techStack.includes(t))
    if (tags.length) set('techStack', [...form.techStack, ...tags])
    set('techInput', '')
  }

  const removeTech = (tag: string) =>
    set('techStack', form.techStack.filter((t) => t !== tag))

  const handleTechKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTech()
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    const tech = form.techInput.trim()
      ? [...form.techStack, ...form.techInput.split(',').map((t) => t.trim()).filter(Boolean)]
      : form.techStack
    try {
      await createProject({
        name: form.name.trim(),
        description: '',
        localFolderPath: form.localFolderPath.trim(),
        githubRepoUrl: form.githubRepoUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        chatGptLinks: [],
        documentationLinks: [],
        notes: '',
        techStack: tech,
        nextAction: form.nextAction.trim(),
        status: form.status,
        priorityTier: form.priorityTier,
        lastOpened: null,
      })
      refreshProjects()
      setSavedCount((n) => n + 1)
      setForm({ ...BLANK })
      nameRef.current?.focus()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeQuickAdd}
      />

      <div className="relative z-10 bg-surface-1 border border-white/10 rounded-2xl w-full max-w-xl mx-4 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-100">Quick Add Project</h2>
            {savedCount > 0 && (
              <span className="text-xs text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                {savedCount} added
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-mono hidden sm:block">⌘⇧N</span>
            <button onClick={closeQuickAdd} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="overflow-y-auto">
          <div className="px-5 py-4 space-y-4">
            {/* Name */}
            <div>
              <input
                ref={nameRef}
                className="input text-base font-medium placeholder-slate-600"
                placeholder="Project name *"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
              />
              {error && <p className="text-danger text-xs mt-1">{error}</p>}
            </div>

            {/* Status + Tier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as ProjectStatus)}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tier</label>
                <select
                  className="input"
                  value={form.priorityTier}
                  onChange={(e) => set('priorityTier', e.target.value as PriorityTier)}
                >
                  {Object.entries(TIER_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Next Action */}
            <div>
              <label className="label">Next Action</label>
              <input
                className="input"
                placeholder="What's the immediate next step?"
                value={form.nextAction}
                onChange={(e) => set('nextAction', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
              />
            </div>

            {/* Local Path */}
            <div>
              <label className="label">Local Path</label>
              <input
                className="input font-mono text-xs"
                placeholder="/home/anthony/Projects/..."
                value={form.localFolderPath}
                onChange={(e) => set('localFolderPath', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
              />
            </div>

            {/* GitHub + Live URL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">GitHub URL</label>
                <input
                  className="input text-xs"
                  placeholder="https://github.com/..."
                  value={form.githubRepoUrl}
                  onChange={(e) => set('githubRepoUrl', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
                />
              </div>
              <div>
                <label className="label">Live URL</label>
                <input
                  className="input text-xs"
                  placeholder="https://..."
                  value={form.liveUrl}
                  onChange={(e) => set('liveUrl', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="label">Tech Stack</label>
              {form.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.techStack.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => removeTech(t)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-3 text-slate-300 border border-white/10 hover:border-danger/30 hover:text-danger/80 transition-colors"
                    >
                      {t}
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              <input
                className="input text-xs"
                placeholder="React, TypeScript, Firebase… (comma or Enter to add)"
                value={form.techInput}
                onChange={(e) => set('techInput', e.target.value)}
                onKeyDown={handleTechKey}
                onBlur={commitTech}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 bg-surface-0/40 rounded-b-2xl shrink-0">
            <p className="text-[11px] text-slate-600">Enter to save · Tab to move between fields</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={closeQuickAdd} className="btn-ghost text-xs">
                Done
              </button>
              <button type="submit" disabled={saving} className="btn-primary text-xs min-w-32">
                {saving ? 'Saving…' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
