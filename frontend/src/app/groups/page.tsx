'use client'
import { Users, Plus, BookOpen, GraduationCap } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

const mockGroups = [
  { name: 'Class 8 - Science', students: 32, assignments: 4, color: 'bg-blue-100 text-blue-700' },
  { name: 'Class 10 - Maths', students: 28, assignments: 6, color: 'bg-purple-100 text-purple-700' },
  { name: 'Class 5 - English', students: 35, assignments: 2, color: 'bg-green-100 text-green-700' },
]

export default function GroupsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar />
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h1 className="font-bold text-base text-gray-900">My Groups</h1>
            </div>
            <p className="text-xs text-gray-500 ml-4">Manage your class groups and students.</p>
          </div>
          <button className="btn-primary opacity-60 cursor-not-allowed" disabled>
            <Plus size={14} /> New Group
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Groups', value: '3', icon: Users },
            { label: 'Total Students', value: '95', icon: GraduationCap },
            { label: 'Active Assignments', value: '12', icon: BookOpen },
          ].map(({ label, value, icon: Icon }) => (
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

        {/* Group Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockGroups.map((g) => (
            <div key={g.name} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${g.color}`}>
                  {g.name.split(' - ')[0]}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-3">{g.name}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><GraduationCap size={12} /> {g.students} Students</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {g.assignments} Assignments</span>
              </div>
            </div>
          ))}

          {/* Add Group Card */}
          <div className="card p-5 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-not-allowed opacity-60 hover:border-gray-300 transition-colors min-h-[120px]">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Create New Group</p>
            <p className="text-xs text-gray-300">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}