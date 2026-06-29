import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project, ProjectInput, ProjectStatus, ProjectCounts } from './types'

const COL = 'projects'

function docToProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    localFolderPath: (data.localFolderPath as string) ?? '',
    githubRepoUrl: (data.githubRepoUrl as string) ?? '',
    liveUrl: (data.liveUrl as string) ?? '',
    firebaseUrl: (data.firebaseUrl as string) ?? '',
    chatGptLinks: (data.chatGptLinks as string[]) ?? [],
    documentationLinks: (data.documentationLinks as string[]) ?? [],
    notes: (data.notes as string) ?? '',
    techStack: (data.techStack as string[]) ?? [],
    nextAction: (data.nextAction as string) ?? '',
    status: (data.status as Project['status']) ?? 'idea',
    priorityTier: (data.priorityTier as Project['priorityTier']) ?? 'small',
    lastOpened: (data.lastOpened as Timestamp) ?? null,
    lastUpdated: (data.lastUpdated as Timestamp) ?? Timestamp.now(),
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
  }
}

// Full collection scan — used by All Projects page only.
export async function getProjects(): Promise<Project[]> {
  const q = query(collection(db, COL), orderBy('lastUpdated', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToProject(d.id, d.data()))
}

// Targeted query for Command Center — fetches only active/growth/watchlist.
// Requires composite index: status ASC + lastUpdated DESC
// See firestore.indexes.json for the index definition.
export const FOCUS_STATUSES: ProjectStatus[] = ['active', 'growth', 'watchlist']

export async function getFocusedProjects(): Promise<Project[]> {
  const q = query(
    collection(db, COL),
    where('status', 'in', FOCUS_STATUSES),
    orderBy('lastUpdated', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToProject(d.id, d.data()))
}

// Server-side aggregate counts — no documents downloaded.
export async function getProjectCounts(): Promise<ProjectCounts> {
  const [totalSnap, archivedSnap] = await Promise.all([
    getCountFromServer(collection(db, COL)),
    getCountFromServer(query(collection(db, COL), where('status', '==', 'archived'))),
  ])
  return {
    total: totalSnap.data().count,
    archived: archivedSnap.data().count,
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return docToProject(snap.id, snap.data())
}

export async function createProject(input: ProjectInput): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...input,
    lastUpdated: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...input,
    lastUpdated: serverTimestamp(),
  })
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}

// touchProject only updates lastOpened — does NOT bump lastUpdated so it doesn't
// push this project to the top of the lastUpdated-ordered query on every view.
export async function touchProject(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    lastOpened: serverTimestamp(),
  })
}
