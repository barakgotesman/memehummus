import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import type { Tag } from '@/types'

interface TagFormModalProps {
  tag: Tag | null
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export default function TagFormModal({ tag, onSave, onClose }: TagFormModalProps) {
  const [name, setName] = useState(tag?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setSaving(true)
    try {
      await onSave(name.trim())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div dir="rtl" className="w-full max-w-sm rounded-2xl bg-surface border border-outline-variant shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">{tag ? 'עריכת תגית' : 'תגית חדשה'}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">שם התגית *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: פוליטיקה" required className="text-right" autoFocus />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              ביטול
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="px-5 py-2 rounded-lg bg-primary-container text-on-surface text-sm font-bold hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
              {saving ? 'שומר…' : 'שמור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
