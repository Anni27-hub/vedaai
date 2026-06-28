'use client'
import { FormEvent, useEffect, useState } from 'react'
import type { ElementType } from 'react'
import { BarChart2, Brain, Copy, FileText, MessageSquare, PenTool, Sparkles, Trash2, Wand2, Zap } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { api } from '@/lib/api'
import { ToolkitRun, ToolkitTool } from '@/types'

const tools: { id: ToolkitTool; icon: ElementType; label: string; hint: string; color: string }[] = [
  { id: 'question-generator', icon: Sparkles, label: 'Question Generator', hint: 'Topic, chapter, difficulty, marks, and number of questions.', color: 'bg-orange-50 text-orange-600' },
  { id: 'rubric-builder', icon: FileText, label: 'Rubric Builder', hint: 'Assignment task, total marks, criteria, and expected answer quality.', color: 'bg-blue-50 text-blue-600' },
  { id: 'lesson-planner', icon: Brain, label: 'Lesson Planner', hint: 'Topic, class, duration, objectives, and activities.', color: 'bg-green-50 text-green-600' },
  { id: 'feedback-ai', icon: MessageSquare, label: 'Feedback AI', hint: 'Student answer, strengths, weak areas, and tone.', color: 'bg-pink-50 text-pink-600' },
  { id: 'essay-evaluator', icon: PenTool, label: 'Essay Evaluator', hint: 'Essay response, rubric, marks, and grading standard.', color: 'bg-yellow-50 text-yellow-700' },
]

export default function ToolkitPage() {
  const [runs, setRuns] = useState<ToolkitRun[]>([])
  const [selected, setSelected] = useState<ToolkitTool>('question-generator')
  const [title, setTitle] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getToolkitRuns().then(setRuns).catch(console.error).finally(() => setLoading(false))
  }, [])

  const activeTool = tools.find((tool) => tool.id === selected)!
  const ActiveIcon = activeTool.icon
  const latest = runs[0]

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setGenerating(true)
    try {
      const run = await api.generateToolkit({ tool: selected, title, input })
      setRuns((items) => [run, ...items])
      setInput('')
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate output')
    } finally {
      setGenerating(false)
    }
  }

  const removeRun = async (id: string) => {
    await api.deleteToolkitRun(id)
    setRuns((items) => items.filter((item) => item._id !== id))
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar label="AI Teacher's Toolkit" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h1 className="font-bold text-base text-gray-900">AI Teacher's Toolkit</h1>
            </div>
            <p className="text-xs text-gray-500 ml-4">Generate classroom-ready teaching material and keep recent outputs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Tools Available', value: tools.length, icon: Zap },
            { label: 'Saved Runs', value: runs.length, icon: Sparkles },
            { label: 'Rubrics & Plans', value: runs.filter((run) => run.tool !== 'question-generator').length, icon: BarChart2 },
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

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_360px] gap-5">
          <div className="space-y-2">
            {tools.map(({ id, icon: Icon, label, color }) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`w-full card p-4 flex items-center gap-3 text-left transition-shadow ${selected === id ? 'ring-2 ring-orange-200 shadow-sm' : 'hover:shadow-sm'}`}
              >
                <span className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}><Icon size={17} /></span>
                <span className="text-sm font-semibold text-gray-900">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl ${activeTool.color} flex items-center justify-center`}>
                <ActiveIcon size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-gray-900">{activeTool.label}</h2>
                <p className="text-xs text-gray-500">{activeTool.hint}</p>
              </div>
            </div>

            <label className="block text-xs font-medium text-gray-700 mb-2">Title</label>
            <input className="input mb-4" placeholder="e.g. Class 8 Electricity revision" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <label className="block text-xs font-medium text-gray-700 mb-2">Teacher Input</label>
            <textarea
              className="input h-52 resize-none"
              placeholder={activeTool.hint}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              minLength={10}
            />
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <button disabled={generating} className="btn-primary mt-4 disabled:opacity-50">
              <Wand2 size={14} /> {generating ? 'Generating...' : 'Generate'}
            </button>
          </form>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-gray-900">Latest Output</h2>
              {latest && <button onClick={() => navigator.clipboard.writeText(latest.output)} className="text-gray-400 hover:text-gray-700"><Copy size={15} /></button>}
            </div>
            {latest ? (
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700 bg-gray-50 rounded-lg p-4 max-h-[420px] overflow-auto">{latest.output}</pre>
            ) : (
              <div className="py-20 text-center">
                <Sparkles size={28} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Generated outputs will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 card p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-4">Recent Toolkit Runs</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-gray-400">No runs yet.</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div key={run._id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{run.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{run.tool.replaceAll('-', ' ')}</p>
                  </div>
                  <button onClick={() => removeRun(run._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
