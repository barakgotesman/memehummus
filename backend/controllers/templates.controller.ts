import { Request, Response, NextFunction } from 'express'
import { listTemplates, getTemplate, recordDownload, getTrendingTemplates, getSimilarTemplates } from '../services/templates.js'

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tag, search, limit, offset } = req.query as { tag?: string; search?: string; limit?: string; offset?: string }
    const result = await listTemplates({
      tag,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await getTemplate(req.params.id)
    res.json(template)
  } catch (err) {
    next(err)
  }
}

export async function download(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown'
    console.log('[download] templateId=%s ip=%s', req.params.id, ip)
    const result = await recordDownload(req.params.id, ip)
    console.log('[download] result=%o', result)
    res.json(result)
  } catch (err) {
    console.error('[download] error:', err)
    next(err)
  }
}

export async function similar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8
    const templates = await getSimilarTemplates(req.params.id, limit)
    res.json(templates)
  } catch (err) {
    next(err)
  }
}

export async function trending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { period } = req.query as { period?: string }
    const templates = await getTrendingTemplates({ period })
    res.json(templates)
  } catch (err) {
    next(err)
  }
}
