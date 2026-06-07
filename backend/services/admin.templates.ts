import prisma from '../lib/prisma.js'
import cloudinary from '../lib/cloudinary.js'
import { AppError } from '../lib/AppError.js'
import { normalizeTemplate } from './templates.js'

const VALID_STATUSES = ['active', 'draft', 'archive']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Guards against injecting arbitrary strings into Prisma relation queries.
 * Tag IDs come from the client so we validate them as UUIDs before hitting the DB.
 */
function validateTagIds(tag_ids: string[]): void {
  if (!Array.isArray(tag_ids)) throw new AppError('tag_ids must be an array')
  if (tag_ids.some((id) => !UUID_RE.test(id))) throw new AppError('tag_ids contains invalid UUIDs')
}

/**
 * Makes a file name safe to use as part of a Cloudinary public_id.
 * Replaces any character that isn't alphanumeric, dot, dash, or underscore, and caps length at 200.
 */
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

/**
 * Creates a new template with optional tag associations.
 * file_path is a Cloudinary public_id — the upload must happen client-side before calling this.
 * @param name - Display name (required, trimmed)
 * @param file_path - Cloudinary public_id of the already-uploaded image (required)
 * @param status - One of: active | draft | archive (default: active)
 * @param tag_ids - Array of existing tag UUIDs to associate; empty array is valid
 */
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

/**
 * Partially updates a template. Only fields present in the payload are changed.
 * When tag_ids is provided, all existing tag relations are replaced (deleteMany + create).
 * This avoids complex diffing — simpler and safe since tag count is always small.
 * @param id - UUID of the template to update
 */
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

/**
 * Deletes a template and its tag relations.
 * templateTag rows are removed first because the DB has a FK constraint on template_id.
 */
export async function deleteTemplate(id: string): Promise<void> {
  if (!UUID_RE.test(id)) throw new AppError('invalid template id')

  const existing = await prisma.template.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw new AppError('template not found', 404)

  await prisma.templateTag.deleteMany({ where: { template_id: id } })
  await prisma.template.delete({ where: { id } })
}

/**
 * Generates a signed Cloudinary upload URL for the admin to upload a template image directly.
 * The client uploads to Cloudinary directly (bypassing our server) using the returned params.
 * Extension is stripped from the publicId — Cloudinary adds the correct extension after upload.
 * @param fileName - Original file name from the client (used to build a human-readable public_id)
 */
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
