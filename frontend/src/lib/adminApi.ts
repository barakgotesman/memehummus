import type { Template, Tag, Suggestion } from '@/types'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}, token?: string): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (res.status === 204) return null as T

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(`שגיאת שרת (${res.status})`)
  }

  const data = await res.json() as { error?: string } & T
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

interface CreateTemplateBody {
  name: string
  description?: string
  status?: string
  file_path?: string
  tag_ids?: string[]
}

interface ApproveSuggestionBody {
  name: string
  description?: string
  tag_ids?: string[]
}

export function createAdminApi(getToken: () => Promise<string | undefined>) {
  const auth = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const token = await getToken()
    return request<T>(path, options, token)
  }

  return {
    getTemplates: (): Promise<Template[]> => auth('/api/admin/templates'),
    createTemplate: (body: CreateTemplateBody): Promise<Template> =>
      auth('/api/admin/templates', { method: 'POST', body: JSON.stringify(body) }),
    updateTemplate: (id: string, body: Partial<CreateTemplateBody>): Promise<Template> =>
      auth(`/api/admin/templates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteTemplate: (id: string): Promise<null> =>
      auth(`/api/admin/templates/${id}`, { method: 'DELETE' }),
    getUploadUrl: (fileName: string): Promise<{ uploadUrl: string; path: string }> =>
      auth('/api/admin/upload-url', { method: 'POST', body: JSON.stringify({ fileName }) }),
    getTags: (): Promise<Tag[]> => auth('/api/admin/tags'),
    createTag: (name: string): Promise<Tag> =>
      auth('/api/admin/tags', { method: 'POST', body: JSON.stringify({ name }) }),
    updateTag: (id: string, name: string): Promise<Tag> =>
      auth(`/api/admin/tags/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    deleteTag: (id: string): Promise<null> => auth(`/api/admin/tags/${id}`, { method: 'DELETE' }),
    getSuggestions: (): Promise<Suggestion[]> => auth('/api/admin/suggestions'),
    updateSuggestionStatus: (id: string, status: string): Promise<Suggestion> =>
      auth(`/api/admin/suggestions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    approveSuggestion: (id: string, body: ApproveSuggestionBody): Promise<{ suggestion: Suggestion; template: Template }> =>
      auth(`/api/admin/suggestions/${id}/approve`, { method: 'POST', body: JSON.stringify(body) }),
  }
}
