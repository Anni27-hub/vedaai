'use client'
import { Library, Search, Filter, BookOpen, FileText, Clock, Star, Plus } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

const mockPapers = [
  { title: 'Quiz on Electricity', subject: 'Science', className: '8th', questions: 10, marks: 20, date: '20-06-2025', starred: true },
  { title: 'Computer Networks Test', subject: 'Computer Science', className: '10th', questions: 7, marks: 10, date: '28-05-2026', starred: false },
  { title: 'English Grammar Quiz', subject: 'English', className: '5th', questions: 15, marks: 30, date: '15-05-2026', starred: true },
]

const stats = [
  { label: 'Saved Papers', value: '3', icon: FileText },
  { label: 'Subjects', value: '3', icon: BookOpen },
  { label: 'Total Questions', value: '32', icon: Star },
]

export default function LibraryPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar label="My Library" />
      <div className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h1 className="font-bold text-base text-gray-900">My Library</h1>
            </div>
            <p className="text-xs text-gray-500 ml-4">All your saved question papers and resources.</p>
          </div>
          <button className="btn-primary opacity-60 cursor-not-allowed" disabled>
            <Plus size={14} /> Save New
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-5">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={13} /> Filter
          </button>
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8" placeholder="Search papers..." readOnly />
          </div>
        </div>

        {/* Paper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPapers.map((p) => (
            <div key={p.title} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-blue-500" />
                </div>
                {p.starred && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{p.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{p.subject} · Class {p.className}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1"><BookOpen size={11} /> {p.questions} Questions</span>
                <span className="flex items-center gap-1"><Star size={11} /> {p.marks} Marks</span>
                <span className="flex items-center gap-1 ml-auto"><Clock size={11} /> {p.date}</span>
              </div>
            </div>
          ))}

          {/* Add placeholder */}
          <div className="card p-5 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-not-allowed opacity-60 min-h-[140px]">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Save a Paper</p>
            <p className="text-xs text-gray-300">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}