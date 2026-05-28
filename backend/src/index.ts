import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import path from 'path'
import mongoose from 'mongoose'
import { setupWebSocket } from './lib/websocket'
import assignmentRoutes from './routes/assignments'
import fs from 'fs'

const app = express()
const PORT = process.env.PORT || 4000

// Create uploads directory
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'vedaai-frontend-dwdwgwmjv-anishs-projects-b43e96af.vercel.app',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/assignments', assignmentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── HTTP + WebSocket server ───────────────────────────────────
const server = http.createServer(app)
setupWebSocket(server)

// ─── Connect MongoDB → start server ───────────────────────────
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Anish:Veda@veda.igml1ep.mongodb.net/?appName=Veda')
    console.log('✅ Connected to MongoDB')

    server.listen(PORT, () => {
      console.log(`✅ API server running on http://localhost:${PORT}`)
      console.log(`✅ WebSocket ready on wss://vedaai-backend-6s8j.onrender.com/ws:${PORT}/ws`)
    })
  } catch (err) {
    console.error('❌ Startup failed:', err)
    process.exit(1)
  }
}

main()
