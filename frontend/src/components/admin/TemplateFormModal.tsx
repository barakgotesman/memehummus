import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import ImageUploadZone from './ImageUploadZone'
import type { Tag, Template } from '@/types'

interface TagSelectorProps {
  tags: Tag[]
  selectedIds: string[]
  onChange: React.Dispatch<React.SetStateAction<string[]>>
}

function TagSelector({ tags, selectedIds, onChange }: TagSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id))
  const suggestions = tags.filter(
    (t) => !selectedIds.includes(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
  )

  function select(id: string) {
    onChange((prev) => [...prev, id])
    setQuery('')
  }

  function remove(id: string) {
    onChange((prev) => prev.filter((x) => x !== id))
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-on-surface mb-2">תגיות</label>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <span key={tag.id} className="flex items-center gap-1 rounded-full bg-primary-container text-on-surface px-2.5 py-0.5 text-xs font-semibold">
              #{tag.name}
              <button type="button" onClick={() => remove(tag.id)} className="hover:text-red-700 leading-none mt-px">✕</button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="הקלד לחיפוש תגית…"
          className="w-full rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-right text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container/50 focus:border-primary-container"
        />
        {open && (query || suggestions.length > 0) && (
          <ul className="absolute z-20 mt-1 w-full rounded-lg border border-outline-variant bg-surface shadow-lg max-h-48 overflow-y-auto">
            {suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-on-surface-variant text-right">לא נמצאו תגיות</li>
            ) : (
              suggestions.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); select(tag.id) }}
                    className="w-full text-right px-3 py-2 text-sm text-on-surface hover:bg-surface-low transition-colors"
                  >
                    #{tag.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

const STATUSES = [
  { value: 'active', label: 'פעיל' },
  { value: 'draft', label: 'טיוטה' },
  { value: 'archive', label: 'ארכיון' },
]

interface SavePayload {
  name: string
  description: string
  status: string
  imageFile: File | null
  tag_ids: string[]
}

interface TemplateFormModalProps {
  template?: Template | null
  tags: Tag[]
  onSave: (payload: SavePayload) => Promise<void>
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

export default function TemplateFormModal({ template, tags, onSave, onClose, onDelete }: TemplateFormModalProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [status, setStatus] = useState(template?.status ?? 'active')
  const [selectedTags, setSelectedTags] = useState<string[]>(template?.tags?.map((t) => t.id) ?? [])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(template?.imageUrl ?? null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave({ name, description, status, imageFile, tag_ids: selectedTags })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div dir="rtl" className="w-full max-w-2xl rounded-2xl bg-surface border border-outline-variant shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">
            {template ? 'עריכת תבנית' : 'הוספת תבנית חדשה'}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">שם התבנית *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: חומוס של אבא" required className="text-right" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">תיאור</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור קצר של התבנית" className="text-right" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">סטטוס פרסום</label>
                <div className="flex gap-3">
                  {STATUSES.map((s) => (
                    <label key={s.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="status" value={s.value} checked={status === s.value} onChange={() => setStatus(s.value)} className="accent-primary-container" />
                      <span className="text-sm text-on-surface">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <TagSelector tags={tags} selectedIds={selectedTags} onChange={setSelectedTags} />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-on-surface">
                תמונת תבנית {!template && '*'}
              </label>
              <ImageUploadZone preview={preview} onChange={(file, url) => { setImageFile(file); setPreview(url) }} />
              {preview && (
                <button type="button" onClick={() => { setImageFile(null); setPreview(null) }} className="text-xs text-on-surface-variant hover:text-error underline">
                  הסר תמונה
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          )}

          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant">
            {template ? (
              confirmDelete ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-error font-medium">בטוח למחוק?</span>
                  <button type="button" onClick={() => onDelete(template.id)} className="text-error font-semibold underline">כן, מחק</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-on-surface-variant underline">ביטול</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-error hover:opacity-80 font-medium underline">
                  מחק תבנית לצמיתות
                </button>
              )
            ) : <span />}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                ביטול
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-primary-container text-on-surface text-sm font-bold hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
                {saving ? 'שומר…' : 'שמור שינויים'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
