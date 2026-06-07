import { useState, useEffect } from 'react'
import { createAdminApi } from '@/lib/adminApi'
import StatCard from '@/components/admin/StatCard'
import SuggestionDetailModal from '@/components/admin/SuggestionDetailModal'
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

interface SuggestionsPageProps {
  getToken: () => Promise<string>
}

export default function SuggestionsPage({ getToken }: SuggestionsPageProps) {
  const adminApi = createAdminApi(getToken)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<Suggestion | null>(null)

  useEffect(() => {
    Promise.all([adminApi.getSuggestions(), adminApi.getTags()])
      .then(([s, t]) => { setSuggestions(s); setTags(t) })
      .finally(() => setFetching(false))
  }, [])

  async function handleApprove(id: string, body: { name: string; description: string; tag_ids: string[] }) {
    const { suggestion } = await adminApi.approveSuggestion(id, body)
    setSuggestions((prev) => prev.map((s) => (s.id === suggestion.id ? suggestion : s)))
    setSelected(null)
  }

  async function handleReject(id: string) {
    const updated = await adminApi.updateSuggestionStatus(id, 'rejected')
    setSuggestions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    setSelected(null)
  }

  const filtered = filter === 'all' ? suggestions : suggestions.filter((s) => s.status === filter)

  const stats = {
    pending:  suggestions.filter((s) => s.status === 'pending').length,
    approved: suggestions.filter((s) => s.status === 'approved').length,
    rejected: suggestions.filter((s) => s.status === 'rejected').length,
  }

  const TABS = [
    { id: 'pending',  label: `ממתינים (${stats.pending})` },
    { id: 'approved', label: 'אושרו' },
    { id: 'rejected', label: 'נדחו' },
    { id: 'all',      label: 'הכל' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">הצעות תבניות</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">הצעות שהוגשו על ידי מבקרי האתר</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="ממתינים" value={stats.pending} icon="⏳" />
        <StatCard label="אושרו" value={stats.approved} icon="✅" />
        <StatCard label="נדחו" value={stats.rejected} icon="❌" />
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <div className="flex gap-1 px-4 pt-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                filter === t.id ? 'border-primary-container text-on-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="py-16 text-center text-on-surface-variant">טוען הצעות…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">אין הצעות בקטגוריה זו</div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className="flex gap-4 p-4 hover:bg-background transition-colors cursor-pointer"
              >
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/templates/${s.image_path}`}
                  alt="הצעה"
                  className="h-24 w-36 object-cover rounded-lg border border-outline-variant shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={s.status} />
                    <span className="text-xs text-on-surface-variant opacity-70">
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  {s.email && (
                    <p className="text-sm text-on-surface font-medium mb-0.5" dir="ltr">{s.email}</p>
                  )}
                  {s.description && (
                    <p className="text-sm text-on-surface-variant line-clamp-2">{s.description}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center text-on-surface-variant text-sm opacity-60">
                  לחץ לפרטים ›
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <SuggestionDetailModal
          suggestion={selected}
          tags={tags}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
