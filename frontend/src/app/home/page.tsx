'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, Clock, CheckCircle, AlertCircle, ArrowRight, Zap, TrendingUp, Users } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { api } from '@/lib/api'
import { Assignment } from '@/types'
import { format } from 'date-fns'

export default function HomePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAssignments().then(setAssignments).catch(console.error).finally(() => setLoading(false))
  }, [])

  const total = assignments.length
  const completed = assignments.filter(a => a.status === 'completed').length
  const pending = assignments.filter(a => a.status === 'pending' || a.status === 'processing').length
  const failed = assignments.filter(a => a.status === 'failed').length
  const recent = assignments.slice(0, 3)

  const fmtDate = (d: string) => {
    try { return format(new Date(d), 'dd MMM yyyy') } catch { return d }
  }

  const statusIcon = (status: Assignment['status']) => {
    if (status === 'completed') return <CheckCircle size={13} className="text-green-500" />
    if (status === 'failed') return <AlertCircle size={13} className="text-red-400" />
    return <Clock size={13} className="text-blue-400 animate-pulse" />
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar label="Home" />
      <div className="flex-1 p-6 overflow-auto">

        {/* Welcome banner */}
        <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full opacity-5 bg-white -translate-y-12 translate-x-12" />
          <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full opacity-5 bg-orange-400 translate-y-8" />
          <p className="text-xs text-gray-400 mb-1">Good morning 👋</p>
          <h1 className="text-xl font-bold mb-1">Welcome back, John Doe</h1>
          <p className="text-sm text-gray-400 mb-5">Delhi Public School, Bokaro Steel City</p>
          <Link href="/assignments/create"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
            <Plus size={14} /> Create Assignment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Assignments', value: loading ? '—' : total, icon: BookOpen, color: 'bg-blue-50 text-blue-500' },
            { label: 'Completed', value: loading ? '—' : completed, icon: CheckCircle, color: 'bg-green-50 text-green-500' },
            { label: 'In Progress', value: loading ? '—' : pending, icon: Clock, color: 'bg-orange-50 text-orange-500' },
            { label: 'Failed', value: loading ? '—' : failed, icon: AlertCircle, color: 'bg-red-50 text-red-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Recent Assignments */}
          <div className="md:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-gray-900">Recent Assignments</h2>
              <Link href="/assignments" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen size={28} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No assignments yet</p>
                <Link href="/assignments/create" className="mt-3 text-xs text-orange-500 hover:underline">
                  Create your first one →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map(a => (
                  <Link key={a._id} href={`/assignments/${a._id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <BookOpen size={14} className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                      <p className="text-[11px] text-gray-400">Due: {fmtDate(a.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {statusIcon(a.status)}
                      <span className="text-[11px] text-gray-500 capitalize">{a.status}</span>
                    </div>
                    <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-sm text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: Plus, label: 'New Assignment', sub: 'Generate with AI', href: '/assignments/create', active: true },
                { icon: Users, label: 'My Groups', sub: 'Manage classes', href: '/groups', active: true },
                { icon: Zap, label: 'AI Toolkit', sub: 'Teaching tools', href: '/toolkit', active: true },
                { icon: TrendingUp, label: 'My Library', sub: 'Saved papers', href: '/library', active: true },
              ].map(({ icon: Icon, label, sub, href }) => (
                <Link key={label} href={href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-50 flex items-center justify-center shrink-0 transition-colors">
                    <Icon size={14} className="text-gray-500 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-400">{sub}</p>
                  </div>
                  <ArrowRight size={12} className="text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
                </Link>
              ))}
            </div>

            {/* AI tip */}
            <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-orange-500" />
                <p className="text-[11px] font-semibold text-orange-700">AI Tip</p>
              </div>
              <p className="text-[11px] text-orange-600 leading-relaxed">
                Upload a PDF chapter when creating an assignment for more accurate, topic-specific questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}