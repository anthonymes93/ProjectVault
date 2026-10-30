import { useCallback, useEffect, useRef, useState } from 'react'
import { createVaultFile, downloadVaultFile, importVaultFile, listVaultFiles, MAX_FILE_BYTES, removeVaultFile, renameVaultFile, saveVaultFile } from '../../lib/vaultFiles'
import type { VaultFile } from '../../lib/vaultFiles'

export function ProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<VaultFile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [collapsed, setCollapsed] = useState<string[]>([])
  const uploadRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const active = files.find(file => file.id === activeId) || null
  const dirty = !!active && !active.binary && draft !== active.content

  const load = useCallback(async () => {
    const next = await listVaultFiles(projectId)
    setFiles(next)
    setActiveId(current => next.some(f => f.id === current) ? current : next[0]?.id ?? null)
  }, [projectId])

  useEffect(() => { load().catch(e => setError(String(e))) }, [load])
  useEffect(() => { setDraft(active && !active.binary ? active.content : '') }, [activeId, active?.content, active?.binary])
  useEffect(() => { setMessage('') }, [activeId])

  const run = async (task: () => Promise<void>) => {
    setError(''); setMessage(''); setBusy(true)
    try { await task() } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  const save = useCallback(async () => {
    if (!active || active.binary || !dirty || busy) return
    setBusy(true); setError('')
    try {
      await saveVaultFile(projectId, active, draft)
      setFiles(prev => prev.map(f => f.id === active.id ? { ...f, content: draft, size: new Blob([draft]).size } : f))
      setMessage('Saved')
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }, [active, busy, dirty, draft, projectId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        const target = e.target as HTMLElement
        if (target.closest('[data-vault-editor]')) { e.preventDefault(); void save() }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [save])

  const select = (file: VaultFile) => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setActiveId(file.id)
  }
  const create = (folder = '') => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    const path = window.prompt('New file path', folder + 'untitled.txt')
    if (!path) return
    run(async () => {
      await createVaultFile(projectId, path, files)
      await load()
      const latest = await listVaultFiles(projectId)
      const created = latest.find(f => f.path === path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim())
      if (created) setActiveId(created.id)
      setMessage('File created')
    })
  }
  const rename = (file: VaultFile) => {
    const path = window.prompt('Rename or move file', file.path)
    if (!path || path === file.path) return
    run(async () => { await renameVaultFile(projectId, file, path, files); await load() })
  }
  const remove = (file: VaultFile) => {
    if (!window.confirm('Permanently delete ' + file.path + '?')) return
    run(async () => { await removeVaultFile(projectId, file.id); await load() })
  }
  const upload = (incoming: FileList | null) => {
    if (!incoming?.length) return
    run(async () => {
      let current = files
      const failures: string[] = []
      for (const file of Array.from(incoming)) {
        try {
          await importVaultFile(projectId, file, file.webkitRelativePath || file.name, current)
          current = await listVaultFiles(projectId)
        } catch (e) { failures.push(file.name + ': ' + (e instanceof Error ? e.message : String(e))) }
      }
      setFiles(current)
      if (!activeId) setActiveId(current[0]?.id ?? null)
      if (failures.length) setError(failures.join(' | '))
      else setMessage('Files uploaded')
      if (uploadRef.current) uploadRef.current.value = ''
    })
  }
  const folders = new Map<string, VaultFile[]>()
  files.forEach(file => {
    const segments = file.path.split('/')
    for (let i = 1; i < segments.length; i++) {
      const dir = segments.slice(0, i).join('/')
      if (!folders.has(dir)) folders.set(dir, [])
    }
  })
  const renderTree = (prefix = '', level = 0): React.ReactNode => {
    const directories = [...folders.keys()].filter(path => path.startsWith(prefix) && path !== prefix && !path.slice(prefix.length).replace(/^\//, '').includes('/')).sort()
    const directFiles = files.filter(file => {
      const remainder = prefix ? file.path.startsWith(prefix + '/') ? file.path.slice(prefix.length + 1) : '' : file.path
      return remainder && !remainder.includes('/')
    }).sort((a,b) => a.path.localeCompare(b.path))
    return <>
      {directories.map(dir => {
        const closed = collapsed.includes(dir)
        return <div key={dir}>
          <button type="button" className="w-full text-left px-2 py-1.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded flex gap-2 items-center" style={{ paddingLeft: 8 + level * 14 }} onClick={() => setCollapsed(old => closed ? old.filter(x => x !== dir) : [...old, dir])}>
            <span className="text-[10px]">{closed ? '▸' : '▾'}</span><span>📁</span><span className="truncate">{dir.split('/').pop()}</span>
          </button>
          {!closed && renderTree(dir, level + 1)}
        </div>
      })}
      {directFiles.map(file => <div key={file.id} className={`group flex items-center gap-1 rounded hover:bg-white/5 ${activeId === file.id ? 'bg-accent/15 text-accent-hover' : 'text-slate-400'}`} style={{ paddingLeft: 8 + level * 14 }}>
        <button type="button" onClick={() => select(file)} className="flex-1 min-w-0 flex gap-2 items-center text-left py-1.5 text-xs">
          <span>{file.binary ? '▣' : '◇'}</span><span className="truncate">{file.path.split('/').pop()}</span>{activeId === file.id && dirty && <span>●</span>}
        </button>
        <button title="Rename" className="opacity-60 hover:opacity-100 text-xs px-1" onClick={() => rename(file)}>✎</button>
        <button title="Delete" className="opacity-60 hover:opacity-100 text-xs px-1" onClick={() => remove(file)}>×</button>
      </div>)}
    </>
  }

  return <div className="card overflow-hidden" data-vault-editor>
    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2 flex-wrap">
      <div><p className="section-title">Project Files</p><p className="text-[11px] text-slate-500 mt-1">{files.length} files · Code editor & file manager</p></div>
      <div className="flex items-center gap-2">
        <input type="file" multiple ref={uploadRef} className="hidden" onChange={e => upload(e.target.files)} />
        <button className="btn-ghost text-xs" onClick={() => uploadRef.current?.click()} disabled={busy}>Upload</button>
        <button className="btn-primary text-xs" onClick={() => create()} disabled={busy}>+ New file</button>
      </div>
    </div>
    {error && <div role="alert" className="bg-danger/10 text-danger px-4 py-2 text-xs">{error}</div>}
    {message && <div role="status" className="text-success px-4 py-2 text-xs">{message}</div>}
    <div className="flex min-h-[360px] h-[520px]">
      <aside className="w-[35%] max-w-[230px] min-w-[120px] bg-surface-2 border-r border-white/10 overflow-y-auto py-2">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-slate-500">Explorer</div>
        {renderTree()}
        {!files.length && <p className="text-xs text-slate-500 px-3 py-4">No files yet. Create one or upload files.</p>}
      </aside>
      <main className="flex-1 min-w-0 flex flex-col bg-[#111827]">
        {active ? <>
          <div className="px-3 py-2 flex justify-between items-center border-b border-white/10 gap-2">
            <span className="text-xs text-slate-300 font-mono truncate" title={active.path}>{active.path}{dirty ? ' ●' : ''}</span>
            <div className="flex gap-2 shrink-0">
              <button className="text-xs text-slate-400 hover:text-white" onClick={() => downloadVaultFile({ ...active, content: active.binary ? active.content : draft })}>↓ Download</button>
              {!active.binary && <button disabled={!dirty || busy} className="text-xs text-accent-hover disabled:text-slate-600" onClick={() => void save()}>{busy ? 'Saving…' : 'Save'}</button>}
            </div>
          </div>
          {active.binary ? <div className="p-6 text-sm text-slate-400">Binary attachment · {Math.ceil(active.size / 1024)} KB. Download to view or edit it.</div> :
            <div className="flex-1 flex overflow-hidden font-mono text-[13px] leading-6" onClick={() => textareaRef.current?.focus()}>
              <div ref={gutterRef} aria-hidden="true" className="py-3 px-3 text-right text-slate-600 select-none overflow-hidden border-r border-white/5 min-w-[48px]">
                {draft.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea ref={textareaRef} spellCheck={false} value={draft} onChange={e => { setDraft(e.target.value); setMessage('') }} onScroll={e => { if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop }} onKeyDown={e => {
                if (e.key === 'Tab') { e.preventDefault(); const el = e.currentTarget; const start = el.selectionStart, end = el.selectionEnd; setDraft(draft.slice(0,start) + '  ' + draft.slice(end)); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2 }) }
              }} aria-label={'Edit ' + active.path} className="flex-1 min-w-0 p-3 bg-transparent text-slate-200 resize-none outline-none whitespace-pre overflow-auto" wrap="off" />
            </div>}
          <div className="border-t border-white/10 px-3 py-1 text-[10px] text-slate-500 flex justify-between"><span>{active.binary ? 'Attachment' : active.path.split('.').pop()?.toUpperCase() || 'TEXT'}</span><span>{active.binary ? active.size : new Blob([draft]).size} bytes · Ctrl+S to save</span></div>
        </> : <div className="flex-1 flex items-center justify-center text-xs text-slate-500">Select or create a file</div>}
      </main>
    </div>
    <div className="px-4 py-2 border-t border-white/10 text-[11px] text-slate-500">Files are saved in this project's Firestore subcollection. {Math.round(MAX_FILE_BYTES / 1000)} KB maximum per file. No automatic saves.</div>
  </div>
}
