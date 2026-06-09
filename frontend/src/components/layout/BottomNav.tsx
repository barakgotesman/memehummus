import { Home, Flame, PlusCircle, User, LogOut, ShieldCheck, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import SearchOverlay from '@/components/search/SearchOverlay'

export default function BottomNav() {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-outline-variant/40 bg-background">
      <a href="/" className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
        <Home className="h-5 w-5" />
        פיד
      </a>

      <a href="/trends" className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
        <Flame className="h-5 w-5" />
        חם
      </a>

      <a href="/generate" className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-primary-container transition-colors">
        <PlusCircle className="h-5 w-5 text-primary-container" />
        צור
      </a>

      <button
        onClick={() => setSearchOpen(true)}
        className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="חיפוש"
      >
        <Search className="h-5 w-5" />
        חיפוש
      </button>

      {/* "אני" — shows user avatar if logged in, or triggers sign-in */}
      <div className="relative flex flex-1" ref={menuRef}>
        <button
          onClick={() => user ? setMenuOpen(v => !v) : signInWithGoogle()}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="אני"
        >
          {user ? (
            <img
              src={user.photoURL ?? ''}
              alt={user.displayName ?? ''}
              className="h-5 w-5 rounded-full object-cover border border-outline-variant"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
          אני
        </button>

        {menuOpen && user && (
          <div className="absolute bottom-full end-0 mb-2 w-48 rounded-xl border border-outline-variant/60 bg-background shadow-lg z-50 py-1 text-right">
            <div className="px-4 py-2 border-b border-outline-variant/40">
              <p className="text-sm font-semibold text-on-surface truncate">{user.displayName}</p>
              <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
            </div>

            {isAdmin && (
              <a
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-primary-container" />
                פאנל ניהול
              </a>
            )}

            <button
              onClick={() => { setMenuOpen(false); signOut() }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
            >
              <LogOut className="h-4 w-4 text-on-surface-variant" />
              התנתק
            </button>
          </div>
        )}
      </div>
    </nav>
    {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
