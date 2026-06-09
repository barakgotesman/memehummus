import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Template } from '@/types'

const PAGE_SIZE = 15

/**
 * Fetches templates with pagination support.
 * Switching `activeTag` resets back to page 1 and clears existing results.
 * `loadMore` appends the next page to the existing list.
 * @param activeTag - Active tag filter. The string 'הכל' (all) is treated as no filter.
 * @param trending - When true, fetches trending templates instead (no pagination)
 * @param period - Trending time window: 'week' or 'all' (only used when trending=true)
 */
export function useTemplates(
  activeTag: string | null,
  { trending = false, period = 'all' }: { trending?: boolean; period?: string } = {}
) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  // Reset and fetch first page whenever tag/trending/period changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setTemplates([])
    setOffset(0)
    setHasMore(false)

    const fetchPromise = trending
      ? api.getTrending(period).then(data => ({ data, hasMore: false }))
      : api.getTemplates({ tag: activeTag === 'הכל' ? null : activeTag, limit: PAGE_SIZE, offset: 0 })

    fetchPromise
      .then(({ data, hasMore }) => {
        if (!cancelled) {
          setTemplates(data)
          setHasMore(hasMore)
          setOffset(PAGE_SIZE)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [activeTag, trending, period])

  /**
   * Fetches the next page and appends results to the existing list.
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const { data, hasMore: more } = await api.getTemplates({
        tag: activeTag === 'הכל' ? null : activeTag,
        limit: PAGE_SIZE,
        offset,
      })
      setTemplates(prev => [...prev, ...data])
      setHasMore(more)
      setOffset(prev => prev + PAGE_SIZE)
    } catch (err) {
      console.error('loadMore failed', err)
    } finally {
      setLoadingMore(false)
    }
  }, [activeTag, offset, hasMore, loadingMore])

  return { templates, loading, loadingMore, error, hasMore, loadMore }
}
