'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, MoreVertical, Trash2, Eye } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { useAssignmentStore } from '@/store'
import { api } from '@/lib/api'
import { Assignment } from '@/types'
import { format } from 'date-fns'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#D1D5DB" strokeWidth="2"/>
              <path d="M14 16h12M14 20h8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M26 26l6 6" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="22" cy="22" r="6" stroke="#EF4444" strokeWidth="2"/>
              <path d="M19 22l2 2 3-3" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-200" />
        <div className="absolute top-0 -left-2 w-2.5 h-2.5 rounded-full bg-blue-200" />
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Link href="/assignments/create" className="btn-primary">
        <Plus size={14} />
        Create Your First Assignment
      </Link>
    </div>
  )
}

function AssignmentCard({ assignment, onDelete }: { assignment: Assignment; onDelete: (id: string) => void }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const fmtDate = (d: string) => {
    try { return format(new Date(d), 'dd-MM-yyyy') } catch { return d }
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-900 pr-4">{assignment.title}</h3>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={14} className="text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
              <button
                onClick={() => { router.push(`/assignments/${assignment._id}`); setMenuOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Eye size={13} /> View Assignment
              </button>
              <button
                onClick={() => { onDelete(assignment._id); setMenuOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>
          <span className="font-medium text-gray-700">Assigned on :</span>{' '}
          {fmtDate(assignment.createdAt)}
        </span>
        <span>
          <span className="font-medium text-gray-700">Due :</span>{' '}
          {fmtDate(assignment.dueDate)}
        </span>
      </div>

      {/* Status badge */}
      <div className="mt-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
          assignment.status === 'completed' ? 'bg-green-50 text-green-700' :
          assignment.status === 'processing' ? 'bg-blue-50 text-blue-700' :
          assignment.status === 'failed' ? 'bg-red-50 text-red-700' :
          'bg-gray-50 text-gray-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            assignment.status === 'completed' ? 'bg-green-500' :
            assignment.status === 'processing' ? 'bg-blue-500 animate-pulse' :
            assignment.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
          {assignment.status}
        </span>
      </div>
    </div>
  )
}

export default function AssignmentsPage() {
  const { assignments, setAssignments, removeAssignment } = useAssignmentStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | Assignment['status']>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAssignments()
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === 'all' || a.status === status
    return matchesSearch && matchesStatus
  })
  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    processing: assignments.filter((a) => a.status === 'processing').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    failed: assignments.filter((a) => a.status === 'failed').length,
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    await api.deleteAssignment(id)
    removeAssignment(id)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar />
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h1 className="font-bold text-base text-gray-900">Assignments</h1>
          </div>
          <p className="text-xs text-gray-500 ml-4">Manage and create assignments for your classes.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-gray-400">Loading...</div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
              <div className="relative">
                <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  className="input pl-8 pr-8 appearance-none capitalize"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((item) => (
                    <option key={item} value={item}>{item} ({counts[item]})</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-8"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(a => (
                <AssignmentCard key={a._id} assignment={a} onDelete={handleDelete} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="card p-10 text-center text-sm text-gray-400">No assignments match your filters.</div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      {assignments.length > 0 && (
        <div className="sticky bottom-6 flex justify-center pb-6">
          <Link href="/assignments/create" className="btn-primary shadow-lg">
            <Plus size={14} />
            Create Assignment
          </Link>
        </div>
      )}
    </div>
  )
}
