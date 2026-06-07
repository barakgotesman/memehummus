import { Router, Request, Response, NextFunction } from 'express'
import { getSuggestionUploadUrl, createSuggestion } from '../services/suggestions.js'

const router = Router()

router.post('/upload-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName } = req.body as { fileName?: string }
    if (!fileName?.trim()) { res.status(400).json({ error: 'fileName is required' }); return }
    res.json(await getSuggestionUploadUrl(fileName))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, image_path, description } = req.body as { email?: string; image_path?: string; description?: string }
    if (!image_path?.trim()) { res.status(400).json({ error: 'image_path is required' }); return }
    res.status(201).json(await createSuggestion({ email, image_path, description }))
  } catch (err) {
    next(err)
  }
})

export default router
