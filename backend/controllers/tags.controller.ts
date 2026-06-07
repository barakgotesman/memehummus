import { Request, Response, NextFunction } from 'express'
import { listTags } from '../services/tags.js'

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
    const tags = await listTags({ limit })
    res.json(tags)
  } catch (err) {
    next(err)
  }
}
