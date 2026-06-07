import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Template } from '@/types'

export function useTemplates(
  activeTag: string | null,
  { trending = false, period = 'all' }: { trending?: boolean; period?: string } = {}
) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const fetchPromise = trending
      ? api.getTrending(period)
      : api.getTemplates({ tag: activeTag === 'הכל' ? null : activeTag })

    fetchPromise
      .then((data) => { if (!cancelled) { setTemplates(data); setLoading(false) } })
      .catch((err: Error) => { if (!cancelled) { setError(err.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [activeTag, trending, period])

  return { templates, loading, error }
}
