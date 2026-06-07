import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Template } from '@/types'

/**
 * Fetches templates from the API, switching between trending and filtered modes.
 * The `cancelled` flag prevents setting state after the component unmounts — without it,
 * a slow fetch completing after unmount would trigger a React state update warning.
 * @param activeTag - Active tag filter. The string 'הכל' (all) is treated as no filter.
 * @param trending - When true, fetches trending templates instead of filtered list
 * @param period - Trending time window: 'week' or 'all' (only used when trending=true)
 */
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
