import { Assignment, Group, LibraryPaper, QuestionPaper, ToolkitRun, ToolkitTool } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
let accessToken: string | null = null
let refreshPromise: Promise<AuthSession> | null = null

export type AuthUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'teacher' | 'admin'
  plan: 'free' | 'pro'
}

export type AuthSession = { accessToken: string; user: AuthUser }

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Request failed')
  return data.data as T
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((res) => parse<AuthSession>(res))
      .then((session) => {
        setAccessToken(session.accessToken)
        return session
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

async function request<T>(url: string, opts: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(opts.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (opts.body && !(opts.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const res = await fetch(`${BASE}${url}`, { ...opts, headers, credentials: 'include' })
  if (res.status === 401 && retry && !url.startsWith('/api/auth/')) {
    await refreshSession()
    return request<T>(url, opts, false)
  }
  return parse<T>(res)
}

export const api = {
  signup: (input: { name: string; email: string; password: string }) =>
    request<AuthSession>('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) =>
    request<AuthSession>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  googleLogin: (credential: string) =>
    request<AuthSession>('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  refreshSession,
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  getAssignments: () => request<Assignment[]>('/api/assignments'),
  getAssignment: (id: string) => request<Assignment>(`/api/assignments/${id}`),
  createAssignment: (formData: FormData) => request<{ assignment: Assignment; jobId: string }>('/api/assignments', { method: 'POST', body: formData }),
  deleteAssignment: (id: string) => request<void>(`/api/assignments/${id}`, { method: 'DELETE' }),
  regenerate: (id: string) => request<{ jobId: string }>(`/api/assignments/${id}/regenerate`, { method: 'POST' }),
  getPaper: (assignmentId: string) => request<QuestionPaper>(`/api/assignments/${assignmentId}/paper`),
  getGroups: () => request<Group[]>('/api/groups'),
  createGroup: (input: { name: string; subject: string; grade: string; studentCount: number; notes?: string }) =>
    request<Group>('/api/groups', { method: 'POST', body: JSON.stringify(input) }),
  updateGroup: (id: string, input: Partial<{ name: string; subject: string; grade: string; studentCount: number; notes: string }>) =>
    request<Group>(`/api/groups/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteGroup: (id: string) => request<void>(`/api/groups/${id}`, { method: 'DELETE' }),
  getLibrary: () => request<LibraryPaper[]>('/api/library'),
  toggleLibraryStar: (id: string) => request<{ _id: string; starred: boolean }>(`/api/library/${id}/star`, { method: 'PATCH' }),
  getToolkitRuns: () => request<ToolkitRun[]>('/api/toolkit/runs'),
  generateToolkit: (input: { tool: ToolkitTool; title: string; input: string }) =>
    request<ToolkitRun>('/api/toolkit/generate', { method: 'POST', body: JSON.stringify(input) }),
  deleteToolkitRun: (id: string) => request<void>(`/api/toolkit/runs/${id}`, { method: 'DELETE' }),
}
