import MemeCard from './MemeCard'
import type { Template } from '@/types'

const SKELETON_ASPECTS = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-[16/9]', 'aspect-[2/3]', 'aspect-[5/4]', 'aspect-[3/2]', 'aspect-[9/16]']

function SkeletonCard({ index }: { index: number }) {
  const aspect = SKELETON_ASPECTS[index % SKELETON_ASPECTS.length]
  return (
    <div className="break-inside-avoid mb-3 flex flex-col overflow-hidden rounded-lg bg-white shadow-card animate-pulse">
      <div className={`${aspect} bg-surface-high`} />
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="h-4 w-2/3 rounded bg-surface-high" />
        <div className="h-4 w-8 rounded bg-surface-high" />
      </div>
    </div>
  )
}

interface MemeGridProps {
  templates: Template[]
  loading: boolean
  error?: string | null
  emptyMessage?: string
}

export default function MemeGrid({ templates, loading, error, emptyMessage = 'לא נמצאו תבניות' }: MemeGridProps) {
  if (loading) {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl">😵</p>
        <p className="mt-4 text-lg font-bold text-on-surface">משהו השתבש</p>
        <p className="mt-1 text-sm text-on-surface-variant">{error}</p>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl">🫙</p>
        <p className="mt-4 text-lg font-bold text-on-surface">{emptyMessage}</p>
      </div>
    )
  }

  const colCount = Math.min(templates.length, 4)
  const colClass =
    colCount <= 1 ? 'columns-1 max-w-xs mx-auto' :
    colCount === 2 ? 'columns-2' :
    colCount === 3 ? 'columns-2 sm:columns-3' :
    'columns-2 sm:columns-3 lg:columns-4'

  return (
    <div className={`${colClass} gap-3`}>
      {templates.map((template) => (
        <div key={template.id} className="break-inside-avoid mb-3">
          <MemeCard template={template} />
        </div>
      ))}
    </div>
  )
}
