import prisma from '../lib/prisma.js'
import { AppError } from '../lib/AppError.js'

export async function listTags({ limit }: { limit?: number } = {}) {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { template_tags: true } } },
  })

  const sorted = tags
    .map(t => ({ id: t.id, name: t.name, count: t._count.template_tags }))
    .sort((a, b) => b.count - a.count)

  return limit ? sorted.slice(0, limit) : sorted
}

export async function createTag(name: string) {
  try {
    return await prisma.tag.create({ data: { name: name.trim() }, select: { id: true, name: true } })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') throw new AppError('תגית עם שם זה כבר קיימת', 409)
    throw new AppError('failed to create tag', 500)
  }
}

export async function updateTag(id: string, name: string) {
  try {
    return await prisma.tag.update({ where: { id }, data: { name: name.trim() }, select: { id: true, name: true } })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') throw new AppError('תגית עם שם זה כבר קיימת', 409)
    throw new AppError('failed to update tag', 500)
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({ where: { id } })
  } catch {
    throw new AppError('failed to delete tag', 500)
  }
}
