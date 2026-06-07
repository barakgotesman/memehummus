interface CategoryFilterProps {
  categories: string[]
  active: string
  onSelect: (cat: string) => void
}

export default function CategoryFilter({ categories, active, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            active === cat
              ? 'bg-primary-container text-on-surface'
              : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
