import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { Server } from 'http'

// Map of assignmentId → Set of connected WebSocket clients
const clients = new Map<string, Set<WebSocket>>()

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Client sends: { type: 'subscribe', assignmentId: '...' }
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.type === 'subscribe' && msg.assignmentId) {
          const id = msg.assignmentId as string
          if (!clients.has(id)) clients.set(id, new Set())
          clients.get(id)!.add(ws)

          ws.on('close', () => {
            clients.get(id)?.delete(ws)
            if (clients.get(id)?.size === 0) clients.delete(id)
          })

          ws.send(JSON.stringify({ type: 'subscribed', assignmentId: id }))
        }
      } catch {
        // ignore malformed messages
      }
    })
  })

  console.log('✅ WebSocket server ready on /ws')
  return wss
}

// Called from worker to push updates to the browser
export function notifyClients(
  assignmentId: string,
  payload: Record<string, unknown>
) {
  const sockets = clients.get(assignmentId)
  if (!sockets) return
  const msg = JSON.stringify(payload)
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg)
  })
}
