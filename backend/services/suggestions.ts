import prisma from '../lib/prisma.js'
import cloudinary from '../lib/cloudinary.js'
import { AppError } from '../lib/AppError.js'

export async function getSuggestionUploadUrl(fileName?: string) {
  if (!fileName?.trim()) throw new AppError('fileName is required')

  // Generate a unique public_id for this suggestion
  const publicId = `suggestions/${Date.now()}_${fileName.trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)}`

  const { signature, timestamp, api_key } = cloudinary.utils.sign_request(
    { public_id: publicId, folder: '' },
    { api_key: process.env.CLOUDINARY_API_KEY!, api_secret: process.env.CLOUDINARY_API_SECRET! }
  )

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    publicId,
    signature,
    timestamp,
    apiKey: api_key,
  }
}

interface CreateSuggestionInput {
  email?: string
  image_path?: string
  description?: string
}

export async function createSuggestion({ email, image_path, description }: CreateSuggestionInput) {
  if (!image_path?.trim()) throw new AppError('image_path is required')

  return prisma.templateSuggestion.create({
    data: {
      email: email?.trim() || null,
      image_path,
      description: description?.trim() || null,
    },
    select: { id: true, status: true, created_at: true },
  })
}

export async function listSuggestions() {
  return prisma.templateSuggestion.findMany({
    orderBy: { created_at: 'desc' },
  })
}

interface ApproveSuggestionInput {
  name: string
  description?: string
  tag_ids: string[]
}

export async function approveSuggestion(id: string, { name, description, tag_ids }: ApproveSuggestionInput) {
  const suggestion = await prisma.templateSuggestion.findUnique({
    where: { id },
    select: { id: true, image_path: true },
  })
  if (!suggestion) throw new AppError('suggestion not found', 404)

  // Rename: copy from suggestions/ folder to templates/ folder in Cloudinary
  const originalName = suggestion.image_path.split('/').pop()
  const newPublicId = `templates/${Date.now()}_${originalName}`

  try {
    await cloudinary.uploader.rename(suggestion.image_path, newPublicId)
  } catch {
    throw new AppError('failed to move suggestion image', 500)
  }

  const template = await prisma.template.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      file_path: newPublicId,
      status: 'draft',
      template_tags: tag_ids?.length
        ? { create: tag_ids.map(tag_id => ({ tag_id })) }
        : undefined,
    },
    select: { id: true, name: true, description: true, file_path: true, status: true, created_at: true },
  })

  const updated = await prisma.templateSuggestion.update({
    where: { id },
    data: { status: 'approved', image_path: newPublicId },
  })

  return { suggestion: updated, template }
}

export async function updateSuggestionStatus(id: string, status: string) {
  const VALID = ['pending', 'approved', 'rejected']
  if (!VALID.includes(status)) throw new AppError(`status must be one of: ${VALID.join(', ')}`)

  return prisma.templateSuggestion.update({
    where: { id },
    data: { status },
  })
}
