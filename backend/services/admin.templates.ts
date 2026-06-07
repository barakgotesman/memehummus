import prisma from '../lib/prisma.js'
import cloudinary from '../lib/cloudinary.js'
import { AppError } from '../lib/AppError.js'
import { normalizeTemplate } from './templates.js'

const VALID_STATUSES = ['active', 'draft', 'archive']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateTagIds(tag_ids: string[]): void {
  if (!Array.isArray(tag_ids)) throw new AppError('tag_ids must be an array')
  if (tag_ids.some((id) => !UUID_RE.test(id))) throw new AppError('tag_ids contains invalid UUIDs')
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
}

const templateInclude = {
  template_tags: { include: { tag: true } },
  template_downloads: { select: { id: true } },
} as const

interface CreateTemplateInput {
  name?: string
  description?: string
  file_path?: string
  status?: string
  tag_ids?: string[]
}

export async function createTemplate({ name, description, file_path, status = 'active', tag_ids = [] }: CreateTemplateInput) {
  if (!name?.trim()) throw new AppError('name is required')
  if (!file_path?.trim()) throw new AppError('file_path is required')
  if (!VALID_STATUSES.includes(status)) throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  validateTagIds(tag_ids)

  const template = await prisma.template.create({
    data: {
      name: name.trim(),
      description,
      file_path,
      status,
      template_tags: tag_ids.length > 0
        ? { create: tag_ids.map(tag_id => ({ tag_id })) }
        : undefined,
    },
    include: templateInclude,
  })

  return normalizeTemplate(template)
}

interface UpdateTemplateInput {
  name?: string
  description?: string
  file_path?: string
  status?: string
  tag_ids?: string[]
}

export async function updateTemplate(id: string, { name, description, file_path, status, tag_ids }: UpdateTemplateInput) {
  if (!UUID_RE.test(id)) throw new AppError('invalid template id')
  if (status !== undefined && !VALID_STATUSES.includes(status))
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  if (tag_ids !== undefined) validateTagIds(tag_ids)

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name.trim()
  if (description !== undefined) updates.description = description
  if (file_path !== undefined) updates.file_path = file_path
  if (status !== undefined) updates.status = status

  if (tag_ids !== undefined) {
    updates.template_tags = {
      deleteMany: {},
      create: tag_ids.map(tag_id => ({ tag_id })),
    }
  }

  const template = await prisma.template.update({
    where: { id },
    data: updates,
    include: templateInclude,
  })

  return normalizeTemplate(template)
}

export async function deleteTemplate(id: string): Promise<void> {
  if (!UUID_RE.test(id)) throw new AppError('invalid template id')

  const existing = await prisma.template.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw new AppError('template not found', 404)

  await prisma.templateTag.deleteMany({ where: { template_id: id } })
  await prisma.template.delete({ where: { id } })
}

export async function getUploadUrl(fileName?: string) {
  if (!fileName?.trim()) throw new AppError('fileName is required')
  const safe = sanitizeFileName(fileName.trim())
  const publicId = `templates/${Date.now()}_${safe.replace(/\.[^.]+$/, '')}`

  const { signature, timestamp, api_key } = cloudinary.utils.sign_request(
    { public_id: publicId },
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
