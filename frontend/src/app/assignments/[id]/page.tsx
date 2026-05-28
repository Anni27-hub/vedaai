'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Download, RefreshCw, Loader2, XCircle } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { api } from '@/lib/api'
import { useJobSocket } from '@/lib/useJobSocket'
import { Assignment, QuestionPaper } from '@/types'
import OutputPage from '@/components/output/OutputPage'

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [paper, setPaper] = useState<QuestionPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [wsMsg, setWsMsg] = useState('')
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const startPolling = () => {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      try {
        const a = await api.getAssignment(id)
        setAssignment(a)
        if (a.status === 'completed') {
          const p = await api.getPaper(id)
          setPaper(p)
          stopPolling()
        }
        if (a.status === 'failed') stopPolling()
      } catch {}
    }, 3000)
  }

  // WebSocket — catches real-time events if page is open during generation
  useJobSocket(id, (msg) => {
    if (msg.assignmentId !== id) return
    if (msg.type === 'processing') {
      setAssignment(a => a ? { ...a, status: 'processing' } : a)
      setWsMsg('AI is generating your question paper...')
    }
    if (msg.type === 'completed') {
      setAssignment(a => a ? { ...a, status: 'completed' } : a)
      stopPolling()
      api.getPaper(id).then(setPaper).catch(console.error)
    }
    if (msg.type === 'failed') {
      setAssignment(a => a ? { ...a, status: 'failed' } : a)
      stopPolling()
    }
  })

  useEffect(() => {
    const init = async () => {
      try {
        const a = await api.getAssignment(id)
        setAssignment(a)

        if (a.status === 'completed') {
          // ✅ Paper is ready — fetch it directly
          const p = await api.getPaper(id).catch(() => null)
          setPaper(p)
        } else if (a.status === 'pending' || a.status === 'processing') {
          // ✅ Still generating — start polling every 3s
          startPolling()
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => stopPolling()
  }, [id])

  const handleRegenerate = async () => {
    if (!assignment) return
    setPaper(null)
    setAssignment(a => a ? { ...a, status: 'pending' } : a)
    await api.regenerate(id)
    startPolling()
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar backHref="/assignments" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar backHref="/assignments" label="Create New" />

      {assignment?.status === 'processing' && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={16} />
          <span className="text-sm text-blue-700">{wsMsg || 'Generating your question paper...'}</span>
        </div>
      )}

      {paper && (
        <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
          <p className="text-sm truncate">Question paper generated successfully!</p>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <button onClick={handleRegenerate}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-lg text-xs hover:bg-white/10">
              <RefreshCw size={12} /> Regenerate
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs hover:bg-white/20">
              <Download size={12} /> Download as PDF
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {paper ? (
          <OutputPage paper={paper} />
        ) : assignment?.status === 'failed' ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <XCircle className="text-red-400" size={40} />
            <p className="text-gray-600 text-sm">Generation failed. Please try again.</p>
            <button onClick={handleRegenerate} className="btn-primary">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="animate-spin text-gray-400" size={32} />
            <p className="text-gray-500 text-sm">{wsMsg || 'AI is writing your question paper...'}</p>
          </div>
        )}
      </div>
    </div>
  )
}