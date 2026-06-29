import { Timestamp } from 'firebase/firestore'

export type ProjectStatus =
  | 'active'
  | 'growth'
  | 'watchlist'
  | 'paused'
  | 'archived'
  | 'completed'
  | 'idea'

export type PriorityTier = 'tiny' | 'small' | 'medium' | 'large'

export interface Project {
  id: string
  name: string
  description: string
  localFolderPath: string
  githubRepoUrl: string
  liveUrl: string
  firebaseUrl: string
  chatGptLinks: string[]
  documentationLinks: string[]
  notes: string
  techStack: string[]
  nextAction: string
  status: ProjectStatus
  priorityTier: PriorityTier
  lastOpened: Timestamp | null
  lastUpdated: Timestamp
  createdAt: Timestamp
}

export type ProjectInput = Omit<Project, 'id' | 'lastUpdated' | 'createdAt'>

export interface ProjectCounts {
  total: number
  archived: number
}

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'bg-success/15 text-success border border-success/20', dot: 'bg-success' },
  growth: { label: 'Growth', color: 'bg-accent/15 text-accent-hover border border-accent/20', dot: 'bg-accent' },
  watchlist: { label: 'Watch List', color: 'bg-warning/15 text-warning border border-warning/20', dot: 'bg-warning' },
  paused: { label: 'Paused', color: 'bg-slate-500/15 text-slate-400 border border-slate-500/20', dot: 'bg-slate-400' },
  archived: { label: 'Archived', color: 'bg-slate-700/15 text-slate-500 border border-slate-700/20', dot: 'bg-slate-500' },
  completed: { label: 'Completed', color: 'bg-info/15 text-info border border-info/20', dot: 'bg-info' },
  idea: { label: 'Idea', color: 'bg-purple-500/15 text-purple-400 border border-purple-500/20', dot: 'bg-purple-400' },
}

export const TIER_CONFIG: Record<PriorityTier, { label: string; color: string }> = {
  tiny: { label: 'Tiny', color: 'text-slate-500' },
  small: { label: 'Small', color: 'text-slate-400' },
  medium: { label: 'Medium', color: 'text-info' },
  large: { label: 'Large', color: 'text-warning' },
}

export const COMMAND_CENTER_STATUSES: ProjectStatus[] = ['active', 'growth', 'watchlist']
