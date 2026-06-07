import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    url: process.env.DATABASE_URL as string,
    async adapter() {
      return new PrismaPg({ connectionString: process.env.DATABASE_URL })
    },
  },
})
