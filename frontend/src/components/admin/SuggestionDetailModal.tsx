import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import type { Suggestion, Tag } from '@/types'

type SuggestionStatus = 'pending' | 'approved' | 'rejected'

const STATUS_MAP: Record<SuggestionStatus, { label: string; cls: string }> = {
  pending:  { label: 'ממתין', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  approved: { label: 'אושר',  cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  rejected: { label: 'נדחה',  cls: 'bg-surface-high text-on-surface-variant' },
}

function StatusBadge({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status as SuggestionStatus] ?? STATUS_MAP.pending
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
}

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
  const filtered = tags.filter(
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
        {open && (query || filtered.length > 0) && (
          <ul className="absolute z-20 mt-1 w-full rounded-lg border border-outline-variant bg-surface shadow-lg max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-on-surface-variant text-right">לא נמצאו תגיות</li>
            ) : (
              filtered.map((tag) => (
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

interface ApproveBody {
  name: string
  description: string
  tag_ids: string[]
}

interface SuggestionDetailModalProps {
  suggestion: Suggestion
  tags: Tag[]
  onClose: () => void
  onApprove: (id: string, body: ApproveBody) => Promise<void>
  onReject: (id: string) => Promise<void>
}

export default function SuggestionDetailModal({ suggestion, tags, onClose, onApprove, onReject }: SuggestionDetailModalProps) {
  const [approving, setApproving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/templates/${suggestion.image_path}`

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onApprove(suggestion.id, { name, description, tag_ids: selectedTags })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleReject() {
    setRejecting(true)
    try {
      await onReject(suggestion.id)
    } finally {
      setRejecting(false)
    }
  }

  const isPending = suggestion.status === 'pending'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div dir="rtl" className="w-full max-w-2xl rounded-2xl bg-surface border border-outline-variant shadow-2xl my-8">

        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">פרטי הצעת תבנית</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <img
            src={imageUrl}
            alt="הצעת תבנית"
            className="w-full max-h-64 object-contain rounded-xl border border-outline-variant bg-background"
          />

          <div className="rounded-xl bg-background border border-outline-variant p-4 space-y-2">
            <h3 className="text-sm font-semibold text-on-surface">פרטי המגיש</h3>
            {suggestion.email ? (
              <p className="text-sm text-on-surface-variant" dir="ltr">{suggestion.email}</p>
            ) : (
              <p className="text-sm text-on-surface-variant opacity-60">לא צוין אימייל</p>
            )}
            {suggestion.description ? (
              <p className="text-sm text-on-surface-variant">{suggestion.description}</p>
            ) : (
              <p className="text-sm text-on-surface-variant opacity-60">אין תיאור</p>
            )}
            <p className="text-xs text-on-surface-variant opacity-60">
              {new Date(suggestion.created_at).toLocaleDateString('he-IL', { dateStyle: 'long' })}
            </p>
          </div>

          <div className="rounded-xl bg-background border border-outline-variant p-4 space-y-2">
            <StatusBadge status={suggestion.status} />
          </div>

          {isPending && (
            <div className="rounded-xl border border-outline-variant p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-on-surface">אישור כתבנית חדשה (טיוטה)</h3>
                {!approving && (
                  <button
                    type="button"
                    onClick={() => setApproving(true)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    + מלא פרטים לאישור
                  </button>
                )}
              </div>

              {approving && (
                <form onSubmit={handleApprove} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">שם תבנית *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: חומוס של אבא" required className="text-right" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">תיאור רשמי</label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור קצר של התבנית" className="text-right" />
                  </div>

                  <TagSelector tags={tags} selectedIds={selectedTags} onChange={setSelectedTags} />

                  {error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                  )}

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => { setApproving(false); setError(null) }}
                      className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'שומר…' : 'אשר וצור טיוטה'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant">
          <div>
            {isPending && (
              <button
                type="button"
                onClick={handleReject}
                disabled={rejecting}
                className="px-4 py-2 rounded-lg bg-surface-high text-on-surface-variant text-sm font-semibold hover:bg-surface-highest transition-colors disabled:opacity-50"
              >
                {rejecting ? 'דוחה…' : 'דחה הצעה'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
