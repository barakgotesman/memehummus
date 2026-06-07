import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const serviceAccountPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? 'memehummus-d887b-firebase-adminsdk-fbsvc-517fd52914.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

export const adminAuth = getAuth()
export const adminStorage = getStorage()
