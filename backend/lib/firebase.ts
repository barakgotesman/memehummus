import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  }
  const filePath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? 'memehummus-d887b-firebase-adminsdk-fbsvc-517fd52914.json')
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

if (!getApps().length) {
  initializeApp({
    credential: cert(loadServiceAccount()),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

export const adminAuth = getAuth()
export const adminStorage = getStorage()
