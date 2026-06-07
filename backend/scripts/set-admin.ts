// Usage: npx tsx backend/scripts/set-admin.ts <email>
import '../lib/firebase.js'
import { adminAuth } from '../lib/firebase.js'

const email = process.argv[2]
if (!email) {
  console.error('Usage: npx tsx backend/scripts/set-admin.ts <email>')
  process.exit(1)
}

const user = await adminAuth.getUserByEmail(email)
await adminAuth.setCustomUserClaims(user.uid, { isAdmin: true })
console.log(`✓ isAdmin=true set for ${email} (uid: ${user.uid})`)
console.log('The user must sign out and sign back in for the new claim to take effect.')
process.exit(0)
