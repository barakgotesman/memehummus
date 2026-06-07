import { Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Template } from '@/types'

interface MemeCardProps {
  template: Template
}

export default function MemeCard({ template }: MemeCardProps) {
  const { id, name, imageUrl, tags = [], download_count = 0 } = template
  const navigate = useNavigate()

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/template/${id}`)}
    >
      <div className="relative overflow-hidden bg-surface-high">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 to-transparent">
          <button className="rounded-full bg-primary-container px-5 py-2 text-sm font-bold text-on-surface shadow hover:bg-primary-fixed-dim transition-colors">
            השתמש בתבנית
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface line-clamp-1">{name}</p>
          {tags.length > 0 && (
            <p className="text-xs text-on-surface-variant line-clamp-1">
              {tags.map((t) => t.name).join(' · ')}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1 text-on-surface-variant text-xs">
          <Download className="h-4 w-4" />
          <span>{download_count.toLocaleString('he-IL')}</span>
        </div>
      </div>
    </div>
  )
}
