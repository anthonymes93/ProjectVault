import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface VaultFile {
  id: string
  path: string
  content: string
  binary: boolean
  mime: string
  size: number
}

const filesRef = (projectId: string) => collection(db, 'projects', projectId, 'files')
export const MAX_FILE_BYTES = 500_000

export function cleanPath(value: string): string {
  const path = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim()
  const parts = path.split('/')
  if (!path || parts.some(part => part === '.' || part === '..' || !part.trim())) throw new Error('Enter a valid file path (for example src/index.js).')
  return path
}

export async function listVaultFiles(projectId: string): Promise<VaultFile[]> {
  const snapshot = await getDocs(query(filesRef(projectId), orderBy('path')))
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() } as VaultFile))
}

export async function createVaultFile(projectId: string, path: string, existing: VaultFile[], content = '', binary = false, mime = 'text/plain', size = 0): Promise<void> {
  const normalized = cleanPath(path)
  if (existing.some(file => file.path.toLowerCase() === normalized.toLowerCase())) throw new Error('A file with that name already exists.')
  if (new Blob([content]).size > 850_000) throw new Error('File exceeds Firestore document storage limit.')
  await addDoc(filesRef(projectId), { path: normalized, content, binary, mime, size: size || new Blob([content]).size, updatedAt: serverTimestamp() })
}

export async function saveVaultFile(projectId: string, file: VaultFile, content: string): Promise<void> {
  if (new Blob([content]).size > MAX_FILE_BYTES) throw new Error('Text file is too large (500 KB maximum).')
  await updateDoc(doc(filesRef(projectId), file.id), { content, size: new Blob([content]).size, updatedAt: serverTimestamp() })
}

export async function renameVaultFile(projectId: string, file: VaultFile, path: string, existing: VaultFile[]): Promise<void> {
  const normalized = cleanPath(path)
  if (existing.some(other => other.id !== file.id && other.path.toLowerCase() === normalized.toLowerCase())) throw new Error('A file with that name already exists.')
  await updateDoc(doc(filesRef(projectId), file.id), { path: normalized, updatedAt: serverTimestamp() })
}

export async function removeVaultFile(projectId: string, fileId: string): Promise<void> {
  await deleteDoc(doc(filesRef(projectId), fileId))
}

export async function importVaultFile(projectId: string, file: File, path: string, existing: VaultFile[]): Promise<void> {
  if (file.size > MAX_FILE_BYTES) throw new Error(file.name + ' exceeds the 500 KB per-file limit.')
  const data = new Uint8Array(await file.arrayBuffer())
  const binary = data.includes(0) || (!file.type.startsWith('text/') && !/\.(js|jsx|ts|tsx|json|css|html|md|txt|py|php|xml|svg|yml|yaml|sh|sql|env|gitignore)$/i.test(file.name))
  let content: string
  if (binary) {
    let chars = ''
    for (const byte of data) chars += String.fromCharCode(byte)
    content = btoa(chars)
  } else {
    content = new TextDecoder().decode(data)
  }
  await createVaultFile(projectId, path, existing, content, binary, file.type || 'application/octet-stream', file.size)
}

export function downloadVaultFile(file: VaultFile): void {
  let blob: Blob
  if (file.binary) {
    const chars = atob(file.content)
    const bytes = Uint8Array.from(chars, char => char.charCodeAt(0))
    blob = new Blob([bytes], { type: file.mime })
  } else blob = new Blob([file.content], { type: file.mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.path.split('/').pop() || 'file'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
