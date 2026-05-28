<<<<<<< HEAD
# VedaAI – AI Assessment Creator

A full-stack application for teachers to create assignments and generate AI-powered question papers.

---

## Architecture Overview

```
vedaai/
├── frontend/          # Next.js 14 + TypeScript + Tailwind + Zustand
├── backend/           # Express + TypeScript + MongoDB + Redis + BullMQ
└── docker-compose.yml # MongoDB + Redis
```

### Flow

```
Teacher fills form → POST /api/assignments
                           ↓
                    Job added to BullMQ queue
                           ↓
                    Worker picks up job
                           ↓
                    Calls Claude AI API
                           ↓
                    Parses structured JSON
                           ↓
                    Stores in MongoDB
                           ↓
                    WebSocket notifies frontend
                           ↓
                    Output page renders question paper
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (assignments + papers) |
| Cache/Queue | Redis + BullMQ |
| Real-time | WebSockets (ws) |
| AI | Anthropic Claude API |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Groq API key

### 1. Clone & Install

```bash
git clone <your-repo>
cd vedaai
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

### 4. Start Backend (API + Worker in separate terminals)

```bash
# Terminal 1: API server
cd backend
npm run dev

# Terminal 2: BullMQ Worker
cd backend
npm run worker
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/assignments | List all assignments |
| POST | /api/assignments | Create assignment + queue job |
| GET | /api/assignments/:id | Get single assignment |
| DELETE | /api/assignments/:id | Delete assignment |
| GET | /api/assignments/:id/paper | Get generated paper |
| POST | /api/assignments/:id/regenerate | Regenerate paper |

## WebSocket

Connect to `ws://localhost:4000/ws`

Send: `{ type: "subscribe", assignmentId: "..." }`

Receive events:
- `{ type: "status", status: "processing" }`
- `{ type: "completed", paperId: "..." }`
- `{ type: "failed", message: "..." }`

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL env vars
```

### Backend → Render
- Create a new Web Service pointing to `/backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add env vars: MONGODB_URI, REDIS_URL, ANTHROPIC_API_KEY, FRONTEND_URL

### Managed services
- MongoDB: MongoDB Atlas (free tier)
- Redis: Upstash Redis (free tier, supports BullMQ)
=======
# vedaai
VedaAI is an AI-powered assessment generation platform that helps teachers create structured question papers instantly using Groq LLMs. Built with Next.js, Node.js, TypeScript, Redis queues, MongoDB, and Docker, it supports automated paper generation, answer keys, assignment management, and real-time processing.
>>>>>>> e0ab7c13c77246e1025ff68f16225852d22af1a5
