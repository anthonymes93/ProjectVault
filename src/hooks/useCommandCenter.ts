import { useState, useEffect } from 'react'
import { getFocusedProjects, getProjectCounts } from '../lib/projects'
import { useApp } from '../contexts/AppContext'
import { firebaseMisconfigured, missingEnvVars } from '../lib/firebase'
import type { Project } from '../lib/types'
import type { ProjectCounts } from '../lib/types'

export interface CommandCenterData {
  focused: Project[]
  counts: ProjectCounts | null
  loading: boolean
  error: string | null
}

export function useCommandCenter(): CommandCenterData {
  const { projectsVersion } = useApp()
  const [focused, setFocused] = useState<Project[]>([])
  const [counts, setCounts] = useState<ProjectCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (firebaseMisconfigured) {
      setError(
        `Missing Firebase environment variables: ${missingEnvVars.join(', ')}. ` +
          'Copy .env.local.example → .env.local and restart the dev server.'
      )
      setLoading(false)
      return
    }

    let cancelled = false
    const startMs = performance.now()

    console.group('[CommandCenter] Loading dashboard data')
    console.log('Start:', new Date().toISOString())
    console.log('Queries: getFocusedProjects (active/growth/watchlist) + getProjectCounts (aggregate)')

    setLoading(true)
    setError(null)

    Promise.all([getFocusedProjects(), getProjectCounts()])
      .then(([focusedData, countData]) => {
        if (cancelled) return
        const elapsed = Math.round(performance.now() - startMs)
        console.log(`✓ ${focusedData.length} focused projects in ${elapsed}ms`)
        console.log('Counts:', countData)
        console.groupEnd()
        setFocused(focusedData)
        setCounts(countData)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[CommandCenter] Query failed:', msg)
        if (msg.includes('index')) {
          console.warn(
            '[CommandCenter] Composite index missing. ' +
              'Deploy firestore.indexes.json or visit the Firebase Console link in the error above.'
          )
        }
        if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
          console.warn(
            '[CommandCenter] Permission denied. Check Firestore security rules allow reads on the projects collection.'
          )
        }
        console.groupEnd()
        setError(msg)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectsVersion])

  return { focused, counts, loading, error }
}
