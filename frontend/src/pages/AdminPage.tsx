import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import TemplatesPage from '@/pages/admin/TemplatesPage'
import TagsPage from '@/pages/admin/TagsPage'
import SuggestionsPage from '@/pages/admin/SuggestionsPage'
import { Sun, Moon, LogOut, Globe, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'templates', label: 'ניהול תבניות', icon: '🖼️' },
  { id: 'tags', label: 'ניהול תגיות', icon: '🏷️' },
  { id: 'suggestions', label: 'הצעות תבניות', icon: '💡' },
]

type SectionId = 'templates' | 'tags' | 'suggestions'

interface SidebarContentProps {
  active: SectionId
  onChange: (id: SectionId) => void
  onClose?: () => void
}

function SidebarContent({ active, onChange, onClose }: SidebarContentProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function handleNav(id: SectionId) {
    onChange(id)
    onClose?.()
  }

  return (
    <>
      <div className="flex items-center gap-2 px-5 py-5 border-b border-outline-variant">
        <span className="text-2xl">🎭</span>
        <span className="font-bold text-base text-on-surface">ניהול חומוס</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id as SectionId)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-right ${
              active === item.id
                ? 'bg-primary-container/20 text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-low'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-outline-variant space-y-1">
        <button
          onClick={() => { navigate('/'); onClose?.() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-surface-low transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span>חזרה לאתר</span>
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-surface-low transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>התנתקות</span>
        </button>
      </div>
    </>
  )
}

interface SidebarProps {
  active: SectionId
  onChange: (id: SectionId) => void
  mobileOpen: boolean
  onClose: () => void
}

function Sidebar({ active, onChange, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-surface border-s border-outline-variant h-screen sticky top-0">
        <SidebarContent active={active} onChange={onChange} />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40" />

          <aside
            className="absolute top-0 right-0 h-full w-64 flex flex-col bg-surface border-s border-outline-variant shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 left-3 p-1.5 rounded-md text-on-surface-variant hover:bg-surface-low transition-colors"
              aria-label="סגור תפריט"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent active={active} onChange={onChange} onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

interface AdminHeaderProps {
  activeSection: SectionId
  onMenuOpen: () => void
}

function AdminHeader({ activeSection, onMenuOpen }: AdminHeaderProps) {
  const { user, signOut } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const sectionLabel = NAV_ITEMS.find(n => n.id === activeSection)?.label ?? 'ניהול'

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur border-b border-outline-variant flex items-center justify-between px-4 md:px-6 h-14">
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuOpen}
          aria-label="פתח תפריט"
          className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-low transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-sm text-on-surface">{sectionLabel}</span>
      </div>

      <span className="hidden md:block text-sm font-semibold text-on-surface-variant">{sectionLabel}</span>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label={dark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm font-medium text-on-surface">
              {user.user_metadata?.full_name?.split(' ')[0]}
            </span>
            <img
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name}
              className="h-8 w-8 rounded-full object-cover border border-outline-variant"
            />
          </div>
        )}
      </div>
    </header>
  )
}

export default function AdminPage() {
  const { isAdmin, loading, getToken } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SectionId>('templates')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/')
  }, [loading, isAdmin])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-on-surface-variant">טוען…</p>
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-surface-low font-sans">
      <Sidebar
        active={activeSection}
        onChange={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        <AdminHeader activeSection={activeSection} onMenuOpen={() => setMobileMenuOpen(true)} />
        <div className="flex-1">
          {activeSection === 'templates' && <TemplatesPage getToken={getToken} />}
          {activeSection === 'tags' && <TagsPage getToken={getToken} />}
          {activeSection === 'suggestions' && <SuggestionsPage getToken={getToken} />}
        </div>
      </main>
    </div>
  )
}
