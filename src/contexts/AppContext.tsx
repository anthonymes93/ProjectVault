import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface AppCtx {
  quickAddOpen: boolean
  openQuickAdd: () => void
  closeQuickAdd: () => void
  projectsVersion: number
  refreshProjects: () => void
}

const AppCtx = createContext<AppCtx>({
  quickAddOpen: false,
  openQuickAdd: () => {},
  closeQuickAdd: () => {},
  projectsVersion: 0,
  refreshProjects: () => {},
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [projectsVersion, setProjectsVersion] = useState(0)

  const openQuickAdd = useCallback(() => setQuickAddOpen(true), [])
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), [])
  const refreshProjects = useCallback(() => setProjectsVersion((v) => v + 1), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setQuickAddOpen(true)
      }
      if (e.key === 'Escape') setQuickAddOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <AppCtx.Provider value={{ quickAddOpen, openQuickAdd, closeQuickAdd, projectsVersion, refreshProjects }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
