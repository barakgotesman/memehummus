import { Home, Flame, PlusCircle, User, LucideIcon } from 'lucide-react'

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  primary?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'פיד', href: '/' },
  { icon: Flame, label: 'חם', href: '/trends' },
  { icon: PlusCircle, label: 'צור', href: '#', primary: true },
  { icon: User, label: 'אני', href: '#' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-outline-variant/40 bg-background">
      {NAV_ITEMS.map(({ icon: Icon, label, href, primary }) => (
        <a
          key={label}
          href={href}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
            primary ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon className={`h-5 w-5 ${primary ? 'text-primary-container' : ''}`} />
          {label}
        </a>
      ))}
    </nav>
  )
}
