'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GoogleButton from './GoogleButton'
import { useAuth } from './AuthProvider'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const auth = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const run = async (action: () => Promise<void>) => {
    setSubmitting(true); setError('')
    try { await action(); router.replace('/home') } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') } finally { setSubmitting(false) }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')); const password = String(data.get('password'))
    run(() => mode === 'signup' ? auth.signup(String(data.get('name')), email, password) : auth.login(email, password))
  }

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center px-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 rounded-lg bg-brand text-white grid place-items-center font-bold">V</div><span className="text-xl font-bold">VedaAI</span></div>
        <h1 className="text-2xl font-bold">{mode === 'signup' ? 'Create your teacher account' : 'Welcome back'}</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">{mode === 'signup' ? 'Start creating intelligent assessments.' : 'Sign in to continue to your workspace.'}</p>
        <GoogleButton onCredential={(credential) => run(() => auth.googleLogin(credential))} />
        <div className="flex items-center gap-3 my-5 text-xs text-gray-400"><span className="h-px bg-gray-200 flex-1" />or use email<span className="h-px bg-gray-200 flex-1" /></div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && <label className="block text-sm font-medium">Full name<input className="input mt-1.5" name="name" required minLength={2} autoComplete="name" /></label>}
          <label className="block text-sm font-medium">Email<input className="input mt-1.5" name="email" required type="email" autoComplete="email" /></label>
          <label className="block text-sm font-medium">Password<input className="input mt-1.5" name="password" required type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <button disabled={submitting} className="btn-brand w-full justify-center disabled:opacity-50">{submitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-6">{mode === 'signup' ? 'Already have an account?' : 'New to VedaAI?'} <Link className="text-orange-600 font-medium" href={mode === 'signup' ? '/login' : '/signup'}>{mode === 'signup' ? 'Sign in' : 'Create account'}</Link></p>
      </div>
    </div>
  )
}
