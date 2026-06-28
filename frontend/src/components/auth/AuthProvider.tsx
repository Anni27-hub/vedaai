'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { api, AuthSession, AuthUser, setAccessToken } from '@/lib/api'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  googleLogin: (credential: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const accept = (session: AuthSession) => {
    setAccessToken(session.accessToken)
    setUser(session.user)
  }

  useEffect(() => {
    api.refreshSession().then(accept).catch(() => setAccessToken(null)).finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: async (email, password) => accept(await api.login({ email, password })),
      signup: async (name, email, password) => accept(await api.signup({ name, email, password })),
      googleLogin: async (credential) => accept(await api.googleLogin(credential)),
      logout: async () => {
        try { await api.logout() } finally {
          setAccessToken(null)
          setUser(null)
        }
      },
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
