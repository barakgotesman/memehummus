type TemplateStatus = 'active' | 'draft' | 'archive'

const STATUS_MAP: Record<TemplateStatus, { label: string; cls: string }> = {
  active: { label: 'פעיל', cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  draft: { label: 'טיוטה', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  archive: { label: 'ארכיון', cls: 'bg-surface-high text-on-surface-variant' },
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, cls } = STATUS_MAP[status as TemplateStatus] ?? STATUS_MAP.active
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
