import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import https from 'https'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env') })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const templates = [
  { name: 'Shocked Feline',    imageUrl: 'https://i.imgflip.com/39t1o.jpg' },
  { name: 'The Future Is Now', imageUrl: 'https://i.imgflip.com/1ur9b0.jpg' },
  { name: 'Confusion 100',     imageUrl: 'https://i.imgflip.com/30b1gx.jpg' },
  { name: 'Monday Morning',    imageUrl: 'https://i.imgflip.com/24y43o.jpg' },
  { name: 'Smug Shiba',        imageUrl: 'https://i.imgflip.com/4t0m5.jpg' },
  { name: 'Blep Master',       imageUrl: 'https://i.imgflip.com/2kbn1e.jpg' },
  { name: 'Brain Melt',        imageUrl: 'https://i.imgflip.com/1jwhww.jpg' },
  { name: 'Gamer Hoard',       imageUrl: 'https://i.imgflip.com/26jxvz.jpg' },
  { name: 'Happy Toast',       imageUrl: 'https://i.imgflip.com/wxica.jpg' },
  { name: 'Chill Vibes Dog',   imageUrl: 'https://i.imgflip.com/3lmzyx.jpg' },
  { name: 'Old Tech Knight',   imageUrl: 'https://i.imgflip.com/28j0te.jpg' },
  { name: 'Curious Frenchie',  imageUrl: 'https://i.imgflip.com/2kbn1e.jpg' },
]

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

for (const template of templates) {
  const publicId = `templates/${slugify(template.name)}`
  console.log(`Uploading ${publicId}...`)

  try {
    // Upload directly from URL — Cloudinary fetches it itself
    const result = await cloudinary.uploader.upload(template.imageUrl, {
      public_id: publicId,
      overwrite: true,
    })

    await prisma.template.create({
      data: { name: template.name, file_path: result.public_id },
    })

    console.log(`  ✓ Done: ${result.public_id}`)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`)
  }
}

await prisma.$disconnect()
console.log('Seeding complete.')
