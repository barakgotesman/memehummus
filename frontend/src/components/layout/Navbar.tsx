import { Search, LogOut, Menu, ShieldCheck, ChevronDown, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import SearchOverlay from '@/components/search/SearchOverlay'

const NAV_LINKS = [
  { label: 'טרנדים', href: '/trends' },
  { label: 'הצע תבנית', href: '/suggest' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-outline-variant/40">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">

          <button
            className="flex md:hidden items-center text-on-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="תפריט"
          >
            <Menu className="h-6 w-6" />
          </button>

          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Meme Hummus" className="h-9 w-9 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-on-surface">
              Meme <span className="text-primary-container">Hummus</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label={dark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              aria-label="חיפוש"
              onClick={() => setSearchOpen(true)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 rounded-full hover:bg-surface-variant transition-colors p-0.5 pe-2"
                  aria-label="תפריט משתמש"
                >
                  <img
                    src={user.user_metadata?.avatar_url as string}
                    alt={user.user_metadata?.full_name as string}
                    className="h-8 w-8 rounded-full object-cover border border-outline-variant"
                  />
                  <ChevronDown className={`h-3.5 w-3.5 text-on-surface-variant transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-48 rounded-xl border border-outline-variant/60 bg-background shadow-lg z-50 py-1 text-right">
                    <div className="px-4 py-2 border-b border-outline-variant/40">
                      <p className="text-sm font-semibold text-on-surface truncate">{user.user_metadata?.full_name as string}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-primary-container" />
                        פאנל ניהול
                      </a>
                    )}

                    <button
                      onClick={() => { setUserMenuOpen(false); signOut() }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-on-surface-variant" />
                      התנתק
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 rounded-full border border-outline-variant px-3 py-1.5 text-sm font-semibold text-on-surface hover:bg-surface-variant transition-colors"
              >
                <GoogleIcon />
                כניסה
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/40 bg-background px-4 py-3 flex flex-col gap-3 text-right">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="text-sm font-semibold text-on-surface-variant">
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
