import { createHash } from 'crypto'
import prisma from '../lib/prisma.js'
import cloudinary from '../lib/cloudinary.js'
import { AppError } from '../lib/AppError.js'

// Same IP downloading the same template within this window counts as one download
const DEDUP_WINDOW_HOURS = 1

/**
 * One-way hash of an IP address for privacy-safe deduplication.
 * We never store raw IPs — only the hash + a salt so the original can't be reversed.
 * @param ip - Raw IP string (IPv4 or IPv6)
 */
function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.IP_HASH_SALT)
    .digest('hex')
}

/**
 * Builds an optimized Cloudinary delivery URL for a template image.
 * fetch_format:auto and quality:auto let Cloudinary choose the best format (WebP/AVIF) per browser.
 * @param publicId - Cloudinary public_id stored in the DB
 */
export function getTemplateImageUrl(publicId: string): string {
  return cloudinary.url(publicId, { fetch_format: 'auto', quality: 'auto' })
}

interface RawTemplate {
  id: string
  name: string
  description?: string | null
  status?: string | null
  file_path: string
  created_at?: Date | string
  template_tags?: Array<{ tag: { id: string; name: string } }>
  template_downloads?: Array<{ id: string }>
}

/**
 * Converts a raw Prisma template row into the API response shape.
 * Computes imageUrl from file_path (Cloudinary public_id) and flattens nested relations.
 * @param t - Raw DB row, optionally with template_tags and template_downloads included
 */
export function normalizeTemplate(t: RawTemplate) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    status: t.status ?? 'active',
    imageUrl: getTemplateImageUrl(t.file_path),
    file_path: t.file_path,
    createdAt: t.created_at,
    tags: t.template_tags?.map((tt) => tt.tag) ?? [],
    download_count: t.template_downloads?.length ?? 0,
  }
}

const templateInclude = {
  template_tags: { include: { tag: true } },
  template_downloads: { select: { id: true } },
} as const

/**
 * Records a download event, deduplicating by hashed IP within DEDUP_WINDOW_HOURS.
 * The same IP downloading the same template within the window is silently ignored.
 * @param templateId - ID of the template being downloaded
 * @param ip - Raw client IP — will be hashed before storage
 * @returns { counted: true } if a new download was recorded, { counted: false } if deduplicated
 */
export async function recordDownload(templateId: string, ip: string) {
  const ipHash = hashIp(ip)
  const since = new Date(Date.now() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000)

  const existing = await prisma.templateDownload.count({
    where: {
      template_id: templateId,
      ip: ipHash,
      downloaded_at: { gte: since },
    },
  })

  if (existing > 0) return { counted: false }

  await prisma.templateDownload.create({
    data: { template_id: templateId, ip: ipHash },
  })

  return { counted: true }
}

/**
 * Returns templates sorted by download count within an optional time window.
 * Aggregation is done in memory (not SQL) because Prisma can't ORDER BY a relation count directly.
 * @param period - 'week' = last 7 days only; anything else = all time
 */
export async function getTrendingTemplates({ period = 'all' }: { period?: string } = {}) {
  const since = period === 'week'
    ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : undefined

  const downloads = await prisma.templateDownload.findMany({
    where: since ? { downloaded_at: { gte: since } } : undefined,
    select: { template_id: true },
  })

  const counts: Record<string, number> = {}
  for (const row of downloads) {
    counts[row.template_id] = (counts[row.template_id] ?? 0) + 1
  }

  const templateIds = Object.keys(counts)
  if (templateIds.length === 0) return []

  const templates = await prisma.template.findMany({
    where: { id: { in: templateIds }, status: 'active' },
    include: templateInclude,
  })

  return templates
    .map(t => ({ ...normalizeTemplate(t), download_count: counts[t.id] ?? 0 }))
    .sort((a, b) => b.download_count - a.download_count)
}

const DEFAULT_PAGE_SIZE = 15

/**
 * Lists active templates with pagination, optional tag filter, or free-text search.
 * Returns `{ data, hasMore }` so the client knows whether more pages exist.
 * Search mode runs two queries in parallel — one by template name, one by matching tag names —
 * then merges and deduplicates while preserving name-match priority.
 * @param tag - Exact tag name to filter by
 * @param search - Free-text search string (matches template names and tag names)
 * @param limit - Max items to return (default 15)
 * @param offset - Number of items to skip for pagination
 */
export async function listTemplates({
  tag,
  search,
  limit = DEFAULT_PAGE_SIZE,
  offset = 0,
}: { tag?: string; search?: string; limit?: number; offset?: number } = {}) {
  if (search) {
    const matchingTags = await prisma.tag.findMany({
      where: { name: { contains: search, mode: 'insensitive' } },
      select: { id: true },
    })
    const matchingTagIds = matchingTags.map(t => t.id)

    const [byName, byTag] = await Promise.all([
      prisma.template.findMany({
        where: { name: { contains: search, mode: 'insensitive' }, status: 'active' },
        orderBy: { created_at: 'desc' },
        include: templateInclude,
      }),
      matchingTagIds.length > 0
        ? prisma.template.findMany({
            where: {
              status: 'active',
              template_tags: { some: { tag_id: { in: matchingTagIds } } },
            },
            orderBy: { created_at: 'desc' },
            include: templateInclude,
          })
        : Promise.resolve([]),
    ])

    const seen = new Set<string>()
    const merged: typeof byName = []
    for (const t of [...byName, ...byTag]) {
      if (!seen.has(t.id)) { seen.add(t.id); merged.push(t) }
    }
    // Paginate the merged search results in memory
    const page = merged.slice(offset, offset + limit)
    return { data: page.map(normalizeTemplate), hasMore: offset + limit < merged.length }
  }

  if (tag) {
    const tagRow = await prisma.tag.findFirst({ where: { name: tag } })
    if (!tagRow) throw new AppError(`tag "${tag}" not found`, 404)

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where: { template_tags: { some: { tag_id: tagRow.id } } },
        orderBy: { created_at: 'desc' },
        include: templateInclude,
        take: limit,
        skip: offset,
      }),
      prisma.template.count({
        where: { template_tags: { some: { tag_id: tagRow.id } } },
      }),
    ])
    return { data: templates.map(normalizeTemplate), hasMore: offset + limit < total }
  }

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      orderBy: { created_at: 'desc' },
      include: templateInclude,
      take: limit,
      skip: offset,
    }),
    prisma.template.count(),
  ])
  return { data: templates.map(normalizeTemplate), hasMore: offset + limit < total }
}

// Returns templates that share at least one tag with the given template.
// Ranked by number of shared tags — more overlap = more similar.
// Templates with no tags return an empty array (no meaningful similarity signal).
export async function getSimilarTemplates(id: string, limit = 8) {
  const target = await prisma.template.findUnique({
    where: { id },
    include: { template_tags: { select: { tag_id: true } } },
  })
  if (!target) throw new AppError('template not found', 404)

  const tagIds = target.template_tags.map(tt => tt.tag_id)
  if (tagIds.length === 0) return []

  // Fetch all active templates sharing at least one tag, excluding the current one.
  // DB ordering by created_at is a tiebreaker before the in-memory tag-count sort.
  const templates = await prisma.template.findMany({
    where: {
      id: { not: id },
      status: 'active',
      template_tags: { some: { tag_id: { in: tagIds } } },
    },
    include: templateInclude,
    orderBy: { created_at: 'desc' },
  })

  // Sort in memory — Prisma can't order by a computed aggregate across a relation
  const ranked = templates
    .map(t => {
      const shared = t.template_tags.filter(tt => tagIds.includes(tt.tag.id)).length
      return { t, shared }
    })
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ t }) => normalizeTemplate(t))

  return ranked
}

export async function getTemplate(id: string) {
  const template = await prisma.template.findUnique({
    where: { id },
    include: templateInclude,
  })
  if (!template) throw new AppError('template not found', 404)
  return normalizeTemplate(template)
}
