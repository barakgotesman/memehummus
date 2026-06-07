import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { index, show, download, trending, similar } from '../controllers/templates.controller.js'

const router = Router()

const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי בקשות, נסה שוב בעוד דקה', status: 429 },
})

router.get('/trending', trending)
router.get('/', index)
router.get('/:id/similar', similar)
router.get('/:id', show)
router.post('/:id/download', downloadLimiter, download)

export default router
