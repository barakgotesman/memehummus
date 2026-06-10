import { Router, Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { createContactSubmission } from '../services/contact.js'

const router = Router()

// Max 5 submissions per IP per 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי פניות — נסה שוב בעוד מעט' },
})

router.post('/', contactLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, message } = req.body as { name?: string; email?: string; message?: string }
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'name, email, and message are required' })
      return
    }
    res.status(201).json(await createContactSubmission({ name, email, message }))
  } catch (err) {
    next(err)
  }
})

export default router
