'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from './AuthProvider'

const publicRoutes = ['/login', '/signup']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isPublic = publicRoutes.includes(pathname)

  useEffect(() => {
    if (loading) return
    if (!user && !isPublic) router.replace('/login')
    if (user && isPublic) router.replace('/home')
  }, [isPublic, loading, router, user])

  if (loading || (!user && !isPublic) || (user && isPublic)) {
    return <div className="min-h-screen grid place-items-center text-sm text-gray-500">Loading VedaAI...</div>
  }
  if (isPublic) return <main>{children}</main>
  return <div className="flex h-screen overflow-hidden"><Sidebar /><main className="flex-1 overflow-auto">{children}</main></div>
}
