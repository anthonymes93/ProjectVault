import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { app } from './firebase'

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
export { onAuthStateChanged, signOut }
export type { User }
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider)
export function requireUserId(): string {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Please sign in with Google.')
  return uid
}
