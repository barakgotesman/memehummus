import { useState, useEffect } from 'react'
import { createAdminApi } from '@/lib/adminApi'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import TemplateFormModal from '@/components/admin/TemplateFormModal'
import type { Template, Tag } from '@/types'

const TABS = [
  { id: 'all', label: 'הכל' },
  { id: 'active', label: 'פעילים' },
  { id: 'draft', label: 'טיוטות' },
  { id: 'archive', label: 'ארכיון' },
]

type ModalState = { mode: 'create' } | { mode: 'edit'; template: Template } | null

interface TemplatesPageProps {
  getToken: () => Promise<string>
}

export default function TemplatesPage({ getToken }: TemplatesPageProps) {
  const adminApi = createAdminApi(getToken)
  const [templates, setTemplates] = useState<Template[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [fetching, setFetching] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    Promise.allSettled([adminApi.getTemplates(), api.getTags()])
      .then(([t, tg]) => {
        if (t.status === 'fulfilled') setTemplates(t.value)
        if (tg.status === 'fulfilled') setTags(tg.value)
      })
      .finally(() => setFetching(false))
  }, [])

  async function uploadImage(file: File): Promise<string> {
    const token = await getToken()
    const res = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fileName: file.name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `שגיאת שרת ${res.status}`)

    // Cloudinary signed upload requires POST with FormData — not a raw PUT
    const form = new FormData()
    form.append('file', file)
    form.append('public_id', data.publicId)
    form.append('signature', data.signature)
    form.append('timestamp', String(data.timestamp))
    form.append('api_key', data.apiKey)
    const uploadRes = await fetch(data.uploadUrl, { method: 'POST', body: form })
    if (!uploadRes.ok) throw new Error(`העלאת הקובץ נכשלה (${uploadRes.status})`)
    return data.publicId
  }

  async function handleSave({ name, description, status, imageFile, tag_ids }: {
    name: string
    description: string
    status: string
    imageFile: File | null
    tag_ids: string[]
  }) {
    let file_path = modal && modal.mode === 'edit' ? modal.template?.file_path : undefined
    if (imageFile) file_path = await uploadImage(imageFile)

    if (modal?.mode === 'create') {
      if (!file_path) throw new Error('נדרשת תמונה לתבנית חדשה')
      const t = await adminApi.createTemplate({ name, description, status, file_path, tag_ids })
      setTemplates((prev) => [t, ...prev])
    } else if (modal?.mode === 'edit') {
      const t = await adminApi.updateTemplate(modal.template.id, { name, description, status, file_path, tag_ids })
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)))
    }
    setModal(null)
  }

  async function handleDelete(id: string) {
    await adminApi.deleteTemplate(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    setModal(null)
  }

  const filtered = templates.filter((t) => {
    const matchTab = tab === 'all' || (t.status ?? 'active') === tab
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const stats = {
    total: templates.length,
    active: templates.filter((t) => (t.status ?? 'active') === 'active').length,
    draft: templates.filter((t) => t.status === 'draft').length,
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">ניהול תבניות</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">נהל, ערוך ומחק תבניות מימים</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-surface text-sm font-bold hover:bg-primary-fixed-dim transition-colors shadow-sm"
        >
          <span>+</span> תבנית חדשה
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label='סה"כ תבניות' value={stats.total} icon="🖼️" />
        <StatCard label="פעילים" value={stats.active} icon="✅" />
        <StatCard label="טיוטות" value={stats.draft} icon="📝" />
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0 gap-4 flex-wrap">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                  tab === t.id ? 'border-primary-container text-on-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="pb-4 w-full sm:w-auto">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש תבנית…" className="text-right w-full sm:w-60" />
          </div>
        </div>

        {fetching ? (
          <div className="py-16 text-center text-on-surface-variant">טוען תבניות…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-low text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">תמונה</th>
                <th className="px-4 py-3 text-right font-semibold">שם התבנית</th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">תגיות</th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">סטטוס</th>
                <th className="px-4 py-3 text-left font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-on-surface-variant">
                    {search ? 'לא נמצאו תבניות התואמות לחיפוש' : 'אין תבניות עדיין — הוסף את הראשונה!'}
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-outline-variant hover:bg-background transition-colors">
                  <td className="px-4 py-3">
                    <img src={t.imageUrl} alt={t.name} className="h-12 w-20 object-cover rounded-lg border border-outline-variant" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-on-surface">{t.name}</p>
                    {t.description && <p className="text-xs text-on-surface-variant mt-0.5 max-w-xs truncate">{t.description}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {t.tags?.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="rounded-full bg-primary-container/20 text-on-primary-container px-2 py-0.5 text-xs font-medium">
                          #{tag.name}
                        </span>
                      ))}
                      {(t.tags?.length ?? 0) > 3 && <span className="text-xs text-on-surface-variant">+{t.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusBadge status={t.status ?? 'active'} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setModal({ mode: 'edit', template: t })}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-primary-container/20 transition-colors"
                    >
                      עריכה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-outline-variant text-xs text-on-surface-variant text-right">
            מציג {filtered.length} מתוך {templates.length} תבניות
          </div>
        )}
      </div>

      {modal && (
        <TemplateFormModal
          template={modal.mode === 'edit' ? modal.template : null}
          tags={tags}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
