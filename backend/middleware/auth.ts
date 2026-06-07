import { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../lib/firebase.js'

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Sends a 401 response and returns null on any failure so the caller can do an early return.
 * This pattern avoids throwing — Express middleware needs to control the response directly.
 */
async function resolveUser(req: Request, res: Response) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    return decoded
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
}

/**
 * Middleware: allows any authenticated Firebase user.
 * Sets req.user to the decoded token payload so downstream handlers can read uid, email, etc.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req, res)
  if (!user) return
  req.user = user
  next()
}

/**
 * Middleware: only allows users with the isAdmin Firebase custom claim set to true.
 * isAdmin is set server-side via backend/scripts/set-admin.ts — it cannot be self-assigned.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req, res)
  if (!user) return

  if (!user.isAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  req.user = user
  next()
}
