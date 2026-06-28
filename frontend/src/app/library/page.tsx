'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, FileText, Filter, Library, Search, Star } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { api } from '@/lib/api'
import { LibraryPaper } from '@/types'
import { format } from 'date-fns'

export default function LibraryPage() {
  const [papers, setPapers] = useState<LibraryPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('all')

  useEffect(() => {
    api.getLibrary().then(setPapers).catch(console.error).finally(() => setLoading(false))
  }, [])

  const subjects = useMemo(() => ['all', ...Array.from(new Set(papers.map((paper) => paper.subject)))], [papers])
  const filtered = papers.filter((paper) => {
    const matchesSearch = `${paper.title} ${paper.subject} ${paper.className}`.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = subject === 'all' || paper.subject === subject
    return matchesSearch && matchesSubject
  })

  const toggleStar = async (paper: LibraryPaper) => {
    const result = await api.toggleLibraryStar(paper._id)
    setPapers((items) => items.map((item) => item._id === paper._id ? { ...item, starred: result.starred } : item))
  }

  const totalQuestions = papers.reduce((sum, paper) => sum + paper.questionCount, 0)
  const starred = papers.filter((paper) => paper.starred).length

  return (
    <div className="flex flex-col h-full">
      <Topbar label="My Library" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h1 className="font-bold text-base text-gray-900">My Library</h1>
            </div>
            <p className="text-xs text-gray-500 ml-4">Generated papers saved from your assignment workflow.</p>
          </div>
          <Link href="/assignments/create" className="btn-primary">
            <FileText size={14} /> Generate Paper
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Saved Papers', value: papers.length, icon: FileText },
            { label: 'Total Questions', value: totalQuestions, icon: BookOpen },
            { label: 'Starred', value: starred, icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{loading ? '-' : value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8" placeholder="Search papers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative max-w-xs">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select className="input pl-8 appearance-none pr-8 capitalize" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((item) => <option key={item} value={item}>{item === 'all' ? 'All subjects' : item}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading library...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <Library size={28} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-800">No papers found</p>
            <p className="text-xs text-gray-500 mt-1">Completed generated papers will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((paper) => (
              <div key={paper._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/assignments/${paper.assignmentId}`} className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-blue-500" />
                  </Link>
                  <button onClick={() => toggleStar(paper)} className="p-1 rounded hover:bg-yellow-50">
                    <Star size={15} className={paper.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  </button>
                </div>
                <Link href={`/assignments/${paper.assignmentId}`} className="block">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{paper.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{paper.subject} - Class {paper.className}</p>
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {paper.questionCount} Qs</span>
                  <span className="flex items-center gap-1"><Star size={11} /> {paper.totalMarks} Marks</span>
                  <span className="flex items-center gap-1 ml-auto"><Clock size={11} /> {format(new Date(paper.createdAt), 'dd MMM')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
