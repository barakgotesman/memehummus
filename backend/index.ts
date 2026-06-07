import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import templatesRouter from './routes/templates.js'
import tagsRouter from './routes/tags.js'
import adminRouter from './routes/admin.js'
import suggestionsRouter from './routes/suggestions.js'
import { errorHandler } from './middleware/error.js'

export const app = express()

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/.*\.vercel\.app$/,
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
]

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/templates', templatesRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/suggestions', suggestionsRouter)
app.use('/api/admin', adminRouter)

app.use(errorHandler)

// Only listen when running directly (not imported by Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = process.env.PORT ?? 3001
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}
