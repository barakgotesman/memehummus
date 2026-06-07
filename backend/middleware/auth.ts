import { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../lib/firebase.js'

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

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req, res)
  if (!user) return
  req.user = user
  next()
}

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
