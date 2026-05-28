import { Assignment, QuestionPaper } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, opts)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Request failed')
  return data.data as T
}

export const api = {
  // Assignments
  getAssignments: () => request<Assignment[]>('/api/assignments'),

  getAssignment: (id: string) => request<Assignment>(`/api/assignments/${id}`),

  createAssignment: (formData: FormData) =>
    request<{ assignment: Assignment; jobId: string }>('/api/assignments', {
      method: 'POST',
      body: formData,
    }),

  deleteAssignment: (id: string) =>
    request<void>(`/api/assignments/${id}`, { method: 'DELETE' }),

  regenerate: (id: string) =>
    request<{ jobId: string }>(`/api/assignments/${id}/regenerate`, { method: 'POST' }),

  // Question Paper
  getPaper: (assignmentId: string) =>
    request<QuestionPaper>(`/api/assignments/${assignmentId}/paper`),
}
