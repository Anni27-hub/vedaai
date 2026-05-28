'use client'
import { useEffect, useRef, useCallback } from 'react'

type WSMessage = {
  type: 'subscribed' | 'status' | 'completed' | 'failed'
  assignmentId: string
  status?: string
  message?: string
  paperId?: string
}

export function useJobSocket(
  assignmentId: string | null,
  onMessage: (msg: WSMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!assignmentId) return

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
    const ws = new WebSocket(`${WS_URL}/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', assignmentId }))
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        onMessageRef.current(msg)
      } catch {
        // ignore
      }
    }

    ws.onerror = () => console.warn('WebSocket error')

    return () => {
      ws.close()
    }
  }, [assignmentId])

  return wsRef
}
