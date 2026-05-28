'use client'
import { Wand2, Sparkles, FileText, BarChart2, Brain, MessageSquare, PenTool, Zap } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

const tools = [
  {
    icon: 'Sparkles',
    label: 'AI Question Generator',
    desc: 'Auto-generate high-quality questions from any topic, chapter, or uploaded document.',
    color: 'bg-orange-50 text-orange-500',
    badge: 'Active',
    badgeColor: 'bg-green-50 text-green-600',
  },
  {
    icon: 'FileText',
    label: 'Rubric Builder',
    desc: 'Create detailed marking rubrics and grading criteria with AI assistance.',
    color: 'bg-blue-50 text-blue-500',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
  {
    icon: 'BarChart2',
    label: 'Grade Analyzer',
    desc: 'Analyze student performance trends and automatically identify learning gaps.',
    color: 'bg-purple-50 text-purple-500',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
  {
    icon: 'Brain',
    label: 'Lesson Planner',
    desc: 'Generate structured lesson plans aligned with your curriculum and learning objectives.',
    color: 'bg-green-50 text-green-500',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
  {
    icon: 'MessageSquare',
    label: 'Student Feedback AI',
    desc: 'Generate personalized, constructive feedback for each student submission automatically.',
    color: 'bg-pink-50 text-pink-500',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
  {
    icon: 'PenTool',
    label: 'Essay Evaluator',
    desc: 'AI-powered evaluation of long-form answers with detailed scoring and comments.',
    color: 'bg-yellow-50 text-yellow-600',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
  },
]

const iconMap: Record<string, React.ElementType> = {
  Sparkles, FileText, BarChart2, Brain, MessageSquare, PenTool
}

const stats = [
  { label: 'Tools Available', value: '6', icon: Zap },
  { label: 'AI Generations', value: '24', icon: Sparkles },
  { label: 'Hours Saved', value: '12', icon: Brain },
]

export default function ToolkitPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar label="AI Teacher's Toolkit" />
      <div className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h1 className="font-bold text-base text-gray-900">AI Teacher's Toolkit</h1>
            </div>
            <p className="text-xs text-gray-500 ml-4">Powerful AI tools to supercharge your teaching workflow.</p>
          </div>
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

        {/* Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(({ icon, label, desc, color, badge, badgeColor }) => {
            const Icon = iconMap[icon]
            const isActive = badge === 'Active'
            return (
              <div
                key={label}
                className={`card p-5 transition-shadow ${isActive ? 'hover:shadow-md cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">{label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                {isActive && (
                  <button className="mt-4 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    Open Tool →
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}