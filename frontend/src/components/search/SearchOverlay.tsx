import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useTags } from '@/hooks/useTags'
import type { Template } from '@/types'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface SearchOverlayProps {
  onClose: () => void
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { tags } = useTags()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }
    setLoading(true)
    api.getTemplates({ search: debouncedQuery })
      .then((data) => { setResults(data.slice(0, 6)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [debouncedQuery])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  function handleResultClick(id: string) {
    navigate(`/template/${id}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md"
      dir="rtl"
    >
      <div className="border-b border-outline-variant/40 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3 rounded-2xl bg-surface-high px-5 py-3 ring-2 ring-primary-container">
            <Search className="h-5 w-5 shrink-0 text-on-surface-variant" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש תבנית, תגית, רגש..."
              className="flex-1 bg-transparent text-base font-medium text-on-surface placeholder:text-on-surface-variant outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-high transition-colors"
          >
            <span>ESC</span>
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-6 py-6">
        {query.trim() && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold text-on-surface-variant">תוצאות</h2>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface-high" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {results.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleResultClick(t.id)}
                    className="group relative overflow-hidden rounded-xl bg-surface-high text-right transition-transform hover:scale-[1.02]"
                  >
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-sm font-bold text-white">{t.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-on-surface-variant">לא נמצאו תוצאות</p>
            )}
          </section>
        )}

        {!query.trim() && (
          <section>
            <h2 className="mb-3 text-sm font-bold text-on-surface-variant">חיפושים נפוצים</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setQuery(tag.name)}
                  className="rounded-full bg-surface-high px-4 py-2 text-sm font-bold text-on-surface hover:bg-primary-container hover:text-on-surface transition-colors"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
