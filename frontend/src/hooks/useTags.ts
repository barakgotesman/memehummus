import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Tag } from '@/types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getTags({ limit: 10 })
      .then((data) => { setTags(data); setLoading(false) })
      .catch((err: Error) => { setError(err.message); setLoading(false) })
  }, [])

  return { tags, loading, error }
}
