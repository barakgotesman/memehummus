import { Router, Request, Response, NextFunction } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getUploadUrl,
} from '../services/admin.templates.js'
import { listTemplates } from '../services/templates.js'
import { listTags, createTag, updateTag, deleteTag } from '../services/tags.js'
import { listSuggestions, updateSuggestionStatus, approveSuggestion } from '../services/suggestions.js'

const router = Router()

router.use(requireAdmin)

router.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listTemplates())
  } catch (err) {
    next(err)
  }
})

router.post('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, file_path, status, tag_ids } = req.body as {
      name?: string; description?: string; file_path?: string; status?: string; tag_ids?: string[]
    }
    const template = await createTemplate({ name, description, file_path, status, tag_ids })
    res.status(201).json(template)
  } catch (err) {
    next(err)
  }
})

router.put('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await updateTemplate(req.params.id, req.body)
    res.json(template)
  } catch (err) {
    next(err)
  }
})

router.delete('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTemplate(req.params.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listTags())
  } catch (err) {
    next(err)
  }
})

router.post('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as { name?: string }
    if (!name?.trim()) { res.status(400).json({ error: 'שם תגית נדרש' }); return }
    res.status(201).json(await createTag(name))
  } catch (err) {
    next(err)
  }
})

router.put('/tags/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as { name?: string }
    if (!name?.trim()) { res.status(400).json({ error: 'שם תגית נדרש' }); return }
    res.json(await updateTag(req.params.id, name))
  } catch (err) {
    next(err)
  }
})

router.delete('/tags/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTag(req.params.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listSuggestions())
  } catch (err) {
    next(err)
  }
})

router.post('/suggestions/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, tag_ids } = req.body as { name?: string; description?: string; tag_ids?: string[] }
    if (!name?.trim()) { res.status(400).json({ error: 'name is required' }); return }
    res.status(201).json(await approveSuggestion(req.params.id, { name, description, tag_ids: tag_ids ?? [] }))
  } catch (err) {
    next(err)
  }
})

router.patch('/suggestions/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status?: string }
    if (!status) { res.status(400).json({ error: 'status is required' }); return }
    res.json(await updateSuggestionStatus(req.params.id, status))
  } catch (err) {
    next(err)
  }
})

router.post('/upload-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getUploadUrl((req.body as { fileName?: string }).fileName)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
