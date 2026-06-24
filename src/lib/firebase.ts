import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missing = REQUIRED_VARS.filter((k) => !import.meta.env[k])
if (missing.length > 0) {
  console.error(
    '[Firebase] Missing required environment variables:',
    missing.join(', '),
    '\nCopy .env.local.example → .env.local and fill in your Firebase project credentials.'
  )
}

export const firebaseMisconfigured = missing.length > 0
export const missingEnvVars = missing

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
