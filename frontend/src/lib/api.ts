import type { Template, Tag } from '@/types'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

/**
 * Generic fetch wrapper for public API calls.
 * Throws on non-2xx responses, using the server's error message when available.
 */
async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await fetch(path, options)
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(`שגיאת שרת (${res.status})`)
  }
  const data = await res.json() as { error?: string } & T
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

export const api = {
  getTemplates: ({ tag, search }: { tag?: string | null; search?: string } = {}): Promise<Template[]> => {
    const params = new URLSearchParams()
    if (tag) params.set('tag', tag)
    if (search) params.set('search', search)
    const qs = params.toString()
    return request(qs ? `/api/templates?${qs}` : '/api/templates')
  },
  getTags: ({ limit }: { limit?: number } = {}): Promise<Tag[]> =>
    request(limit ? `/api/tags?limit=${limit}` : '/api/tags'),
  getTemplate: (id: string): Promise<Template> => request(`/api/templates/${id}`),
  getSimilarTemplates: (id: string, limit = 8): Promise<Template[]> =>
    request(`/api/templates/${id}/similar?limit=${limit}`),
  recordDownload: (id: string): Promise<{ counted: boolean }> =>
    request(`/api/templates/${id}/download`, { method: 'POST' }),
  getTrending: (period?: string): Promise<Template[]> =>
    request(period ? `/api/templates/trending?period=${period}` : '/api/templates/trending'),

  suggestions: {
    getUploadUrl: (fileName: string): Promise<{ uploadUrl: string; path: string }> =>
      request('/api/suggestions/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      }),

    // Direct PUT to Cloudinary — bypasses our server entirely. Content-Type must match the file
    // or Cloudinary rejects the upload with a format mismatch error.
    uploadFile: async (file: File, uploadUrl: string): Promise<void> => {
      const res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!res.ok) throw new Error('העלאת הקובץ נכשלה')
    },

    submit: ({ email, image_path, description }: { email?: string; image_path: string; description?: string }): Promise<unknown> =>
      request('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, image_path, description: description || undefined }),
      }),
  },
}
