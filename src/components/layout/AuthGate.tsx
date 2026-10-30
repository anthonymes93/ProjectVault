import { useEffect, useState, type ReactNode } from 'react'
import { auth, loginWithGoogle, onAuthStateChanged, signOut, type User } from '../../lib/auth'

export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => onAuthStateChanged(auth, current => { setUser(current); setReady(true) }, reason => { setError(reason.message); setReady(true) }), [])
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-400">Checking sign-in…</div>
  if (!user) return <div className="min-h-screen flex items-center justify-center px-5"><div className="card p-8 max-w-md w-full text-center">
    <div className="text-3xl mb-3">▣</div><h1 className="text-2xl font-semibold mb-2">ProjectVault</h1>
    <p className="text-slate-400 text-sm mb-6">Sign in with Google to access your private project workspace.</p>
    <button className="btn-primary w-full justify-center" onClick={() => { setError(''); loginWithGoogle().catch(err => setError(err.message)) }}>Continue with Google</button>
    {error && <p role="alert" className="text-danger text-xs mt-4">{error}</p>}
    <p className="text-xs text-slate-500 mt-5">Each Google account gets its own project data.</p>
  </div></div>
  return <div><div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 bg-surface-2 border border-white/10 rounded-lg shadow-xl px-3 py-2">
    <span className="text-xs text-slate-400 max-w-[160px] truncate">{user.email}</span>
    <button className="text-xs text-accent-hover hover:underline" onClick={() => void signOut(auth)}>Sign out</button>
  </div>{children}</div>
}
