import { useState, useEffect } from 'react'
import { createAdminApi } from '@/lib/adminApi'
import { Input } from '@/components/ui/Input'
import StatCard from '@/components/admin/StatCard'
import TagFormModal from '@/components/admin/TagFormModal'
import type { Tag } from '@/types'

interface TagsPageProps {
  getToken: () => Promise<string>
}

export default function TagsPage({ getToken }: TagsPageProps) {
  const adminApi = createAdminApi(getToken)
  const [tags, setTags] = useState<Tag[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ tag: Tag | null } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    adminApi.getTags()
      .then(setTags)
      .finally(() => setFetching(false))
  }, [])

  async function handleSave(name: string) {
    if (modal?.tag) {
      const updated = await adminApi.updateTag(modal.tag.id, name)
      setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } else {
      const created = await adminApi.createTag(name)
      setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setModal(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await adminApi.deleteTag(id)
      setTags((prev) => prev.filter((t) => t.id !== id))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const filtered = tags.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">ניהול תגיות</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">צור, ערוך ומחק תגיות לסיווג תבניות</p>
        </div>
        <button
          onClick={() => setModal({ tag: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-surface text-sm font-bold hover:bg-primary-fixed-dim transition-colors shadow-sm"
        >
          <span>+</span> תגית חדשה
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label='סה"כ תגיות' value={tags.length} icon="🏷️" />
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-4 pt-4 pb-4">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש תגית…" className="text-right w-full sm:w-60" />
        </div>

        {fetching ? (
          <div className="py-16 text-center text-on-surface-variant">טוען תגיות…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-low text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">שם התגית</th>
                <th className="px-4 py-3 text-left font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-16 text-on-surface-variant">
                    {search ? 'לא נמצאו תגיות התואמות לחיפוש' : 'אין תגיות עדיין — הוסף את הראשונה!'}
                  </td>
                </tr>
              )}
              {filtered.map((tag) => (
                <tr key={tag.id} className="border-t border-outline-variant hover:bg-background transition-colors">
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary-container/20 text-on-primary-container px-3 py-1 text-sm font-medium">
                      #{tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-start gap-2 items-center">
                      <button
                        onClick={() => setModal({ tag })}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-primary-container/20 transition-colors"
                      >
                        עריכה
                      </button>
                      {confirmDeleteId === tag.id ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <span className="text-error font-medium">בטוח?</span>
                          <button onClick={() => handleDelete(tag.id)} disabled={deletingId === tag.id} className="text-error font-semibold underline disabled:opacity-50">
                            {deletingId === tag.id ? '…' : 'מחק'}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-on-surface-variant underline">ביטול</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(tag.id)}
                          className="px-3 py-1.5 rounded-lg border border-error/30 text-xs font-semibold text-error hover:bg-error/10 transition-colors"
                        >
                          מחק
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-outline-variant text-xs text-on-surface-variant text-right">
            מציג {filtered.length} מתוך {tags.length} תגיות
          </div>
        )}
      </div>

      {modal !== null && (
        <TagFormModal tag={modal.tag} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
