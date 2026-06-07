import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export const FONT_OPTIONS = [
  { label: 'Secular One', value: "'Secular One', sans-serif" },
  { label: 'Heebo', value: "'Heebo', sans-serif" },
  { label: 'Rubik', value: "'Rubik', sans-serif" },
  { label: 'Frank Ruhl Libre', value: "'Frank Ruhl Libre', serif" },
  { label: 'Noto Sans Hebrew', value: "'Noto Sans Hebrew', sans-serif" },
  { label: 'Varela Round', value: "'Varela Round', sans-serif" },
  { label: 'Assistant', value: "'Assistant', sans-serif" },
]

interface FontFamilyPickerProps {
  value: string
  onChange: (value: string) => void
}

export default function FontFamilyPicker({ value, onChange }: FontFamilyPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = FONT_OPTIONS.find(f => f.value === value) ?? FONT_OPTIONS[0]

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-high px-3 py-2 text-sm text-on-surface hover:bg-surface-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span style={{ fontFamily: selected.value }}>{selected.label}</span>
        <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-card">
          {FONT_OPTIONS.map(font => (
            <li key={font.value}>
              <button
                type="button"
                onClick={() => { onChange(font.value); setOpen(false) }}
                className={`w-full px-3 py-2.5 text-right text-sm transition-colors hover:bg-surface-high ${
                  font.value === value ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
