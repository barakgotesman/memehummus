import { useState, useEffect, useMemo } from 'react'
import { Mail, MailOpen, Search, X } from 'lucide-react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}

interface Props {
  getToken: () => Promise<string>
}

export default function ContactSubmissionsPage({ getToken }: Props) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [fetching, setFetching] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  // filters
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = await getToken()
    return fetch(path, { ...options, headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
  }

  useEffect(() => {
    authFetch('/api/admin/contact')
      .then((r) => r.json())
      .then(setSubmissions)
      .finally(() => setFetching(false))
  }, [])

  async function toggleRead(s: ContactSubmission) {
    const next = !s.read
    // Optimistic update
    setSubmissions((prev) => prev.map((x) => x.id === s.id ? { ...x, read: next } : x))
    try {
      await authFetch(`/api/admin/contact/${s.id}/read`, { method: 'PATCH', body: JSON.stringify({ read: next }) })
    } catch {
      // Revert on failure
      setSubmissions((prev) => prev.map((x) => x.id === s.id ? { ...x, read: s.read } : x))
    }
  }

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (readFilter === 'read' && !s.read) return false
      if (readFilter === 'unread' && s.read) return false

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false
      }

      const date = new Date(s.created_at)
      if (dateFrom && date < new Date(dateFrom)) return false
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (date > to) return false
      }

      return true
    })
  }, [submissions, search, readFilter, dateFrom, dateTo])

  const unreadCount = submissions.filter((s) => !s.read).length

  function clearFilters() {
    setSearch('')
    setReadFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const hasFilters = search || readFilter !== 'all' || dateFrom || dateTo

  if (fetching) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface-high animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-sm text-on-surface-variant">
        <span>{submissions.length} פניות סה"כ</span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-on-primary">{unreadCount} לא נקראו</span>
        )}
      </div>

      {/* Filter panel */}
      <div className="rounded-xl border border-outline-variant bg-surface p-4 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg bg-surface-high px-3 py-2 ring-1 ring-outline-variant focus-within:ring-primary-container">
          <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או אימייל..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-on-surface-variant hover:text-on-surface">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          {/* Read filter */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-on-surface-variant">סטטוס קריאה</p>
            <div className="flex gap-1">
              {(['all', 'unread', 'read'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setReadFilter(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${readFilter === v ? 'bg-primary text-on-primary' : 'bg-surface-high text-on-surface-variant hover:bg-primary-container/30'}`}
                >
                  {v === 'all' ? 'הכל' : v === 'unread' ? 'לא נקראו' : 'נקראו'}
                </button>
              ))}
            </div>
          </div>

          {/* Date from */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-on-surface-variant">מתאריך</p>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg bg-surface-high border border-outline-variant px-3 py-1.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary-container"
            />
          </div>

          {/* Date to */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-on-surface-variant">עד תאריך</p>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg bg-surface-high border border-outline-variant px-3 py-1.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary-container"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-high transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              נקה פילטרים
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-4xl">✉️</span>
          <p className="text-on-surface-variant font-medium">{hasFilters ? 'לא נמצאו תוצאות' : 'אין פניות עדיין'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border transition-colors ${s.read ? 'border-outline-variant bg-surface' : 'border-primary-container/60 bg-primary-container/10'}`}
            >
              <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => {
                  setExpanded(expanded === s.id ? null : s.id)
                  if (!s.read) toggleRead(s)
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleRead(s) }}
                  className="mt-0.5 shrink-0 text-on-surface-variant hover:text-primary transition-colors"
                  title={s.read ? 'סמן כלא נקרא' : 'סמן כנקרא'}
                >
                  {s.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-primary" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${s.read ? 'font-medium text-on-surface' : 'font-bold text-on-surface'}`}>{s.name}</p>
                    <time className="text-xs text-on-surface-variant shrink-0">
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </time>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 break-all">{s.email}</p>
                  {expanded !== s.id && (
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{s.message}</p>
                  )}
                </div>
              </div>

              {expanded === s.id && (
                <div className="px-4 pb-4 border-t border-outline-variant/40 pt-3 ms-11">
                  <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{s.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
