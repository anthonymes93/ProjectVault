import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createProject } from '../lib/projects'
import { useApp } from '../contexts/AppContext'
import { STATUS_CONFIG, TIER_CONFIG } from '../lib/types'
import type { ProjectStatus, PriorityTier } from '../lib/types'

const EXAMPLE = `Project Vault | /home/anthony/Projects/ProjectVault | https://github.com/you/project-vault | https://projectvault.vercel.app | active | large | React, TypeScript, Firebase, Tailwind
Weather App | /home/anthony/Projects/WeatherApp | https://github.com/you/weather-app |  | growth | small | React, OpenWeather API
CLI Todo | /home/anthony/Projects/CLITodo |  |  | paused | tiny | Node.js`

interface ParsedRow {
  uid: string
  name: string
  localFolderPath: string
  githubRepoUrl: string
  liveUrl: string
  status: ProjectStatus
  priorityTier: PriorityTier
  techInput: string
  selected: boolean
}

function parseStatus(s: string): ProjectStatus {
  const v = s.toLowerCase().trim()
  if (v.includes('growth')) return 'growth'
  if (v.includes('watch')) return 'watchlist'
  if (v.includes('active')) return 'active'
  if (v.includes('pause')) return 'paused'
  if (v.includes('archive')) return 'archived'
  if (v.includes('complete')) return 'completed'
  if (v.includes('idea')) return 'idea'
  return 'idea'
}

function parseTier(s: string): PriorityTier {
  const v = s.toLowerCase().replace(/\s/g, '').trim()
  if (v.includes('large') || v === 'tier1' || v === '1') return 'large'
  if (v.includes('medium') || v === 'tier2' || v === '2') return 'medium'
  if (v.includes('small') || v === 'tier3' || v === '3') return 'small'
  if (v.includes('tiny') || v === 'tier4' || v === '4') return 'tiny'
  return 'small'
}

let uidCounter = 0
function uid() { return String(++uidCounter) }

function parsePaste(text: string): ParsedRow[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .filter((line) => {
      const lower = line.toLowerCase()
      return !(lower.startsWith('project name') && lower.includes('local path'))
    })
    .map((line) => {
      const cols = line.split('|').map((c) => c.trim())
      return {
        uid: uid(),
        name: cols[0] ?? '',
        localFolderPath: cols[1] ?? '',
        githubRepoUrl: cols[2] ?? '',
        liveUrl: cols[3] ?? '',
        status: parseStatus(cols[4] ?? ''),
        priorityTier: parseTier(cols[5] ?? ''),
        techInput: cols[6] ?? '',
        selected: true,
      }
    })
    .filter((r) => r.name)
}

function RowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: ParsedRow
  onChange: (updated: Partial<ParsedRow>) => void
  onRemove: () => void
}) {
  return (
    <tr className={`group border-b border-white/5 ${!row.selected ? 'opacity-40' : ''}`}>
      <td className="py-2 pl-4 pr-2 w-6">
        <input
          type="checkbox"
          checked={row.selected}
          onChange={(e) => onChange({ selected: e.target.checked })}
          className="accent-indigo-500 cursor-pointer"
        />
      </td>
      <td className="py-2 pr-3 min-w-[180px]">
        <input
          className="input py-1 text-xs"
          value={row.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Project name *"
        />
      </td>
      <td className="py-2 pr-3 w-28">
        <select
          className="input py-1 text-xs"
          value={row.status}
          onChange={(e) => onChange({ status: e.target.value as ProjectStatus })}
        >
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3 w-24">
        <select
          className="input py-1 text-xs"
          value={row.priorityTier}
          onChange={(e) => onChange({ priorityTier: e.target.value as PriorityTier })}
        >
          {Object.entries(TIER_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3 min-w-[140px]">
        <div className="space-y-1">
          {row.localFolderPath && (
            <input
              className="input py-1 text-[10px] font-mono"
              value={row.localFolderPath}
              onChange={(e) => onChange({ localFolderPath: e.target.value })}
              placeholder="Local path"
              title="Local folder path"
            />
          )}
          {!row.localFolderPath && (
            <input
              className="input py-1 text-[10px] font-mono text-slate-600"
              value=""
              onChange={(e) => onChange({ localFolderPath: e.target.value })}
              placeholder="+ local path"
            />
          )}
        </div>
      </td>
      <td className="py-2 pr-3 min-w-[140px]">
        <div className="space-y-1">
          <input
            className="input py-1 text-[10px]"
            value={row.githubRepoUrl}
            onChange={(e) => onChange({ githubRepoUrl: e.target.value })}
            placeholder="GitHub URL"
          />
          <input
            className="input py-1 text-[10px]"
            value={row.liveUrl}
            onChange={(e) => onChange({ liveUrl: e.target.value })}
            placeholder="Live URL"
          />
        </div>
      </td>
      <td className="py-2 pr-3 min-w-[140px]">
        <input
          className="input py-1 text-[10px]"
          value={row.techInput}
          onChange={(e) => onChange({ techInput: e.target.value })}
          placeholder="React, TS, …"
        />
      </td>
      <td className="py-2 pr-3 w-8 text-right">
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-700 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

type Phase = 'paste' | 'preview' | 'done'

export function ImportProjects() {
  const { refreshProjects } = useApp()
  const [phase, setPhase] = useState<Phase>('paste')
  const [pasteText, setPasteText] = useState('')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [importError, setImportError] = useState('')

  const handleParse = () => {
    const parsed = parsePaste(pasteText)
    if (!parsed.length) return
    setRows(parsed)
    setPhase('preview')
  }

  const updateRow = (uid: string, update: Partial<ParsedRow>) =>
    setRows((rs) => rs.map((r) => (r.uid === uid ? { ...r, ...update } : r)))

  const removeRow = (uid: string) =>
    setRows((rs) => rs.filter((r) => r.uid !== uid))

  const selectedRows = rows.filter((r) => r.selected && r.name.trim())

  const handleImport = async () => {
    if (!selectedRows.length) return
    setImporting(true)
    setImportError('')
    try {
      await Promise.all(
        selectedRows.map((row) =>
          createProject({
            name: row.name.trim(),
            description: '',
            localFolderPath: row.localFolderPath.trim(),
            githubRepoUrl: row.githubRepoUrl.trim(),
            liveUrl: row.liveUrl.trim(),
            chatGptLinks: [],
            documentationLinks: [],
            notes: '',
            techStack: row.techInput
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            nextAction: '',
            status: row.status,
            priorityTier: row.priorityTier,
            lastOpened: null,
          })
        )
      )
      setImportedCount(selectedRows.length)
      refreshProjects()
      setPhase('done')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link
          to="/"
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 mb-3"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Command Center
        </Link>
        <h1 className="text-xl font-semibold text-slate-100">Import Projects</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Paste multiple projects in pipe-delimited format, review, then import all at once.
        </p>
      </div>

      {/* Phase: Paste */}
      {phase === 'paste' && (
        <div className="space-y-5">
          <div className="card p-5">
            <p className="section-title mb-3">Format</p>
            <p className="text-xs text-slate-500 mb-3">
              One project per line. Columns separated by <code className="bg-surface-3 px-1.5 py-0.5 rounded text-slate-300 font-mono text-[11px]">|</code>. Leave a column blank with empty space. Lines starting with <code className="bg-surface-3 px-1.5 py-0.5 rounded text-slate-300 font-mono text-[11px]">#</code> are ignored.
            </p>
            <div className="bg-surface-0 border border-white/5 rounded-lg p-3 text-[11px] font-mono text-slate-400 leading-loose">
              Project Name | Local Path | GitHub URL | Live URL | Status | Tier | Tech Stack
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600 mb-1.5">Status values: active, growth, watchlist, paused, archived, completed, idea</p>
              <p className="text-xs text-slate-600">Tier values: large (Tier 1), medium (Tier 2), small (Tier 3), tiny (Tier 4)</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Paste your projects</label>
              <button
                type="button"
                onClick={() => setPasteText(EXAMPLE)}
                className="text-xs text-slate-600 hover:text-accent-hover transition-colors"
              >
                Load example
              </button>
            </div>
            <textarea
              className="textarea font-mono text-xs leading-relaxed"
              rows={14}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={EXAMPLE}
              spellCheck={false}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleParse}
              disabled={!pasteText.trim()}
              className="btn-primary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Parse &amp; Preview
            </button>
          </div>
        </div>
      )}

      {/* Phase: Preview */}
      {phase === 'preview' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{selectedRows.length}</span> of {rows.length} selected
              </span>
              {rows.some((r) => !r.name.trim()) && (
                <span className="text-xs text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded-full">
                  {rows.filter((r) => !r.name.trim()).length} rows missing name
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPhase('paste')} className="btn-ghost text-xs">
                ← Edit paste
              </button>
              <button
                onClick={handleImport}
                disabled={importing || selectedRows.length === 0}
                className="btn-primary"
              >
                {importing
                  ? `Importing ${selectedRows.length}…`
                  : `Import ${selectedRows.length} Project${selectedRows.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {importError && (
            <div className="card p-3 border-danger/30 bg-danger/5">
              <p className="text-danger text-xs">{importError}</p>
            </div>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-2.5 pl-4 pr-2 text-left w-6">
                    <input
                      type="checkbox"
                      checked={rows.every((r) => r.selected)}
                      onChange={(e) => setRows((rs) => rs.map((r) => ({ ...r, selected: e.target.checked })))}
                      className="accent-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 pr-3 text-left section-title font-medium">Name</th>
                  <th className="py-2.5 pr-3 text-left section-title font-medium w-28">Status</th>
                  <th className="py-2.5 pr-3 text-left section-title font-medium w-24">Tier</th>
                  <th className="py-2.5 pr-3 text-left section-title font-medium">Local Path</th>
                  <th className="py-2.5 pr-3 text-left section-title font-medium">URLs</th>
                  <th className="py-2.5 pr-3 text-left section-title font-medium">Tech Stack</th>
                  <th className="py-2.5 pr-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <RowEditor
                    key={row.uid}
                    row={row}
                    onChange={(u) => updateRow(row.uid, u)}
                    onRemove={() => removeRow(row.uid)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={importing || selectedRows.length === 0}
              className="btn-primary"
            >
              {importing
                ? `Importing ${selectedRows.length}…`
                : `Import ${selectedRows.length} Project${selectedRows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Phase: Done */}
      {phase === 'done' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-1">
            {importedCount} project{importedCount !== 1 ? 's' : ''} imported
          </h2>
          <p className="text-sm text-slate-500 mb-6">They're now in your vault. Set next actions to bring them into focus.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setPasteText(''); setRows([]); setPhase('paste') }}
              className="btn-ghost"
            >
              Import more
            </button>
            <Link to="/projects" className="btn-primary">
              View all projects
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
