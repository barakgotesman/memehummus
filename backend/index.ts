import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import templatesRouter from './routes/templates.js'
import tagsRouter from './routes/tags.js'
import adminRouter from './routes/admin.js'
import suggestionsRouter from './routes/suggestions.js'
import { errorHandler } from './middleware/error.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }))
app.use(express.json())

app.use('/api/templates', templatesRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/suggestions', suggestionsRouter)
app.use('/api/admin', adminRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
