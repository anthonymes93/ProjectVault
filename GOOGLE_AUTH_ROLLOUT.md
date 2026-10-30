# Google sign-in + private projects rollout

**Do not merge/deploy only the app while the existing public Firestore rules are live.**

1. **Back up Firestore project data first.** Existing documents live in the top-level `projects` collection. The migration does not delete or move them, and preserves each document ID and its `files` subcollection.
2. In Firebase Console -> Build -> Authentication -> Sign-in method, enable **Google**. Under Authentication -> Settings -> Authorized domains, authorize the deployed app domain if missing.
3. Sign in with your intended Google account (a local test of this branch works), then find the UID under Authentication -> Users in Firebase Console. **Verify the account's email there before claiming data.** Never associate projects by a publicly supplied UID.
4. From a trusted local computer, download a Firebase service-account JSON file from Firebase Console -> Project settings -> Service accounts. Keep the JSON **outside the repository**. In a terminal, set `GOOGLE_APPLICATION_CREDENTIALS` to its absolute path. Install the CLI script's dependency with `npm install --no-save firebase-admin`.
5. Run `node scripts/claim-legacy-projects.cjs YOUR_UID` to preview the list of legacy projects, then `node scripts/claim-legacy-projects.cjs YOUR_UID --apply` to assign them to the verified account. Existing owned projects are not reassigned.
6. **Deploy the restrictive** `firestore.rules` from this feature branch using `firebase deploy --only firestore:rules`. The old public rules must be replaced before confidential information is stored. Avoid a prolonged window with public rules after owner IDs have been assigned.
7. Deploy the new frontend from this branch and test the owner account and a second Google account. Verify that the second user can create projects and cannot read any owner documents or files. After rollout, delete the service-account JSON from your computer or securely rotate/revoke it as appropriate.

**Existing open file-manager PR:** This branch already includes the file-manager changes. Merge this PR instead of merging the original separately.

**Security note:** The Firebase console deployment must be verified: editing Firestore rules in GitHub does not publish them. Authentication alone is not access control; the restrictive Firestore rules enforce ownership.
