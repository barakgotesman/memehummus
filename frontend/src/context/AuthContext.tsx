import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<unknown>
  signOut: () => Promise<unknown>
  getToken: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const tokenResult = await u.getIdTokenResult()
        setIsAdmin(tokenResult.claims.isAdmin === true)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())

  const signOut = () => firebaseSignOut(auth)

  const getToken = async (): Promise<string | undefined> => {
    return auth.currentUser?.getIdToken()
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
