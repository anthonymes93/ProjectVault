import { useState, useEffect } from 'react'
import { getProjects } from '../lib/projects'
import { useApp } from '../contexts/AppContext'
import { firebaseMisconfigured, missingEnvVars } from '../lib/firebase'
import type { Project } from '../lib/types'

export function useProjects() {
  const { projectsVersion } = useApp()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (firebaseMisconfigured) {
      setError(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}`)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getProjects()
      .then((data) => {
        if (cancelled) return
        setProjects(data)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load projects')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectsVersion])

  return { projects, loading, error }
}
