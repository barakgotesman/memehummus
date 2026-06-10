import prisma from '../lib/prisma.js'
import { AppError } from '../lib/AppError.js'

interface CreateContactInput {
  name: string
  email: string
  message: string
}

/**
 * Saves a contact form submission to the database.
 * @param input - name, email, and message from the form
 * @returns The created submission (id + created_at only)
 */
export async function createContactSubmission({ name, email, message }: CreateContactInput) {
  if (!name?.trim()) throw new AppError('name is required')
  if (!email?.trim()) throw new AppError('email is required')
  if (!message?.trim()) throw new AppError('message is required')

  return prisma.contactSubmission.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    },
    select: { id: true, created_at: true },
  })
}

/**
 * Lists all contact submissions, newest first. Admin-only.
 */
export async function listContactSubmissions() {
  return prisma.contactSubmission.findMany({
    orderBy: { created_at: 'desc' },
  })
}

/**
 * Toggles the read status of a contact submission.
 * @param id - Submission UUID
 * @param read - New read value
 */
export async function setContactRead(id: string, read: boolean) {
  const existing = await prisma.contactSubmission.findUnique({ where: { id } })
  if (!existing) throw new AppError('submission not found', 404)
  return prisma.contactSubmission.update({ where: { id }, data: { read } })
}
