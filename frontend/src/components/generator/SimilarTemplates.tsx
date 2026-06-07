import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import MemeGrid from '@/components/memes/MemeGrid'
import type { Template } from '@/types'

interface SimilarTemplatesProps {
  templateId: string
}

export default function SimilarTemplates({ templateId }: SimilarTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getSimilarTemplates(templateId)
      .then(setTemplates)
      .catch(() => setError('לא ניתן לטעון תבניות דומות'))
      .finally(() => setLoading(false))
  }, [templateId])

  // Hide the section entirely if there's nothing to show — avoids an empty heading
  if (!loading && !error && templates.length === 0) return null

  return (
    <section dir="rtl" className="mt-10">
      <h2 className="mb-4 text-lg font-bold text-on-surface">תבניות דומות</h2>
      <MemeGrid
        templates={templates}
        loading={loading}
        error={error}
        emptyMessage="אין תבניות דומות"
      />
    </section>
  )
}
