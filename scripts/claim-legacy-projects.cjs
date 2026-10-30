#!/usr/bin/env node
// One-time owner assignment of legacy ProjectVault projects.
// Requires Firebase Admin credentials in GOOGLE_APPLICATION_CREDENTIALS.
// npm install --no-save firebase-admin
// node scripts/claim-legacy-projects.cjs YOUR_FIREBASE_UID
// node scripts/claim-legacy-projects.cjs YOUR_FIREBASE_UID --apply
const admin = require('firebase-admin')
const uid = process.argv[2]
const apply = process.argv.includes('--apply')
if (!uid || uid.startsWith('-') || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Usage: GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node scripts/claim-legacy-projects.cjs FIREBASE_UID [--apply]')
  process.exit(1)
}
admin.initializeApp({ credential: admin.credential.applicationDefault() })
async function main() {
  const user = await admin.auth().getUser(uid)
  console.log('Target Google account:', user.email || uid)
  const db = admin.firestore()
  const snapshot = await db.collection('projects').get()
  const legacy = snapshot.docs.filter(doc => !doc.data().ownerUid)
  console.log('Legacy projects without an owner:', legacy.length)
  for (const project of legacy) console.log(' - ', project.id, project.data().name || '(unnamed)')
  console.log('Already owned projects (will not be touched):', snapshot.size - legacy.length)
  if (!apply) { console.log('Dry run only. Pass --apply to assign these legacy projects to the specified user.'); return }
  if (!legacy.length) return
  for (let i = 0; i < legacy.length; i += 400) {
    const batch = db.batch()
    for (const project of legacy.slice(i, i + 400)) batch.update(project.ref, { ownerUid: uid })
    await batch.commit()
  }
  console.log('Assigned', legacy.length, 'projects to', user.email || uid)
}
main().catch(e => { console.error(e); process.exit(1) })
