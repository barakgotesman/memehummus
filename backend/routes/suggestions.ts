import { Router, Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { getSuggestionUploadUrl, createSuggestion } from '../services/suggestions.js'

const router = Router()

// Max 10 suggestion uploads/submissions per IP per 15 minutes
const suggestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי הצעות — נסה שוב בעוד מעט' },
})

router.post('/upload-url', suggestLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName } = req.body as { fileName?: string }
    if (!fileName?.trim()) { res.status(400).json({ error: 'fileName is required' }); return }
    res.json(await getSuggestionUploadUrl(fileName))
  } catch (err) {
    next(err)
  }
})

router.post('/', suggestLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, image_path, description } = req.body as { email?: string; image_path?: string; description?: string }
    if (!image_path?.trim()) { res.status(400).json({ error: 'image_path is required' }); return }
    res.status(201).json(await createSuggestion({ email, image_path, description }))
  } catch (err) {
    next(err)
  }
})

export default router
