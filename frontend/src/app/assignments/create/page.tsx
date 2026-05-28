'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Plus, Minus, X, Mic, Calendar, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { useFormStore, useAssignmentStore } from '@/store'
import { api } from '@/lib/api'

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Essay Questions',
  'Fill in the Blanks',
  'True/False',
  'Match the Following',
]

export default function CreateAssignmentPage() {
  const router = useRouter()
  const store = useFormStore()
  const { addAssignment } = useAssignmentStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg']
    if (!allowed.includes(f.type)) {
      setError('Only PDF, TXT, PNG, JPG files allowed.')
      return
    }
    store.setFile(f)
    setError('')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const validate = () => {
    if (!store.dueDate) return 'Please set a due date.'
    if (store.questionTypes.length === 0) return 'Add at least one question type.'
    for (const qt of store.questionTypes) {
      if (!qt.type) return 'Select a question type.'
      if (qt.count < 1) return 'Number of questions must be at least 1.'
      if (qt.marks < 1) return 'Marks must be at least 1.'
    }
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setSubmitting(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('dueDate', store.dueDate)
      fd.append('questionTypes', JSON.stringify(store.questionTypes))
      fd.append('additionalInstructions', store.additionalInstructions)
      fd.append('title', `Assignment – ${new Date().toLocaleDateString()}`)
      if (store.file) fd.append('file', store.file)

      const { assignment } = await api.createAssignment(fd)
      addAssignment(assignment)
      store.resetForm()
      router.push(`/assignments/${assignment._id}`)
    } catch (e: any) {
      setError(e.message || 'Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar backHref="/assignments" />

      <div className="flex-1 overflow-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h1 className="font-bold text-base text-gray-900">Create Assignment</h1>
          </div>
          <p className="text-xs text-gray-500 ml-4">Set up a new assignment for your students</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full mb-8 max-w-2xl">
          <div className="h-1 bg-gray-900 rounded-full w-1/2" />
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Assignment Details Card */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm text-gray-900 mb-1">Assignment Details</h2>
            <p className="text-xs text-gray-500 mb-5">Basic information about your assignment</p>

            {/* File Upload */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4 ${
                dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {store.file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Upload size={14} className="text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{store.file.name}</span>
                  <button onClick={() => store.setFile(null)} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={20} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Choose a file or drag & drop it here</p>
                  <p className="text-xs text-gray-400 mb-4">PDF, PNG, JPG</p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.txt,.png,.jpg,.jpeg"
                      onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                    />
                  </label>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center mb-6">Upload images of your preferred document/image</p>

            {/* Due Date */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-700 mb-2">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  className="input pr-10"
                  value={store.dueDate}
                  onChange={e => store.setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Question Types Table */}
            <div className="mb-5">
              <div className="grid grid-cols-[1fr_100px_80px_32px] gap-2 mb-2 px-1">
                <span className="text-xs font-medium text-gray-600">Question Type</span>
                <span className="text-xs font-medium text-gray-600 text-center">No. of Questions</span>
                <span className="text-xs font-medium text-gray-600 text-center">Marks</span>
                <span />
              </div>

              <div className="space-y-2">
                {store.questionTypes.map((qt, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-center">
                    {/* Type select */}
                    <div className="relative">
                      <select
                        className="input appearance-none pr-7 text-xs"
                        value={qt.type}
                        onChange={e => store.updateQuestionType(idx, 'type', e.target.value)}
                      >
                        {QUESTION_TYPE_OPTIONS.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Count stepper */}
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => store.updateQuestionType(idx, 'count', Math.max(1, qt.count - 1))}
                        className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus size={10} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        className="w-8 text-center text-xs border border-gray-200 rounded py-1 focus:outline-none focus:border-orange-300"
                        value={qt.count}
                        onChange={e => store.updateQuestionType(idx, 'count', Number(e.target.value))}
                      />
                      <button
                        onClick={() => store.updateQuestionType(idx, 'count', qt.count + 1)}
                        className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    {/* Marks stepper */}
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => store.updateQuestionType(idx, 'marks', Math.max(1, qt.marks - 1))}
                        className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus size={10} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        className="w-8 text-center text-xs border border-gray-200 rounded py-1 focus:outline-none focus:border-orange-300"
                        value={qt.marks}
                        onChange={e => store.updateQuestionType(idx, 'marks', Number(e.target.value))}
                      />
                      <button
                        onClick={() => store.updateQuestionType(idx, 'marks', qt.marks + 1)}
                        className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => store.removeQuestionType(idx)}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Question Type */}
              <button
                onClick={store.addQuestionType}
                className="flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                  <Plus size={11} className="text-white" />
                </div>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="flex justify-end gap-6 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <span>Total Questions : <strong>{store.totalQuestions()}</strong></span>
                <span>Total Marks : <strong>{store.totalMarks()}</strong></span>
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Additional Information <span className="text-gray-400 font-normal">(For better output)</span>
              </label>
              <div className="relative">
                <textarea
                  className="input resize-none h-20 pr-10"
                  placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                  value={store.additionalInstructions}
                  onChange={e => store.setAdditionalInstructions(e.target.value)}
                />
                <Mic size={14} className="absolute right-3 bottom-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Generating...' : 'Next'}
              {!submitting && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
