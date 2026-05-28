# VedaAI – AI-Powered Assessment Generation Platform

VedaAI is a full-stack AI-powered assessment creation platform designed to help teachers generate structured question papers instantly. The platform automates assignment creation, AI-based question generation, answer key creation, real-time processing, and assignment management through an interactive dashboard.

---

## Architecture Overview

```txt
vedaai/
├── frontend/          # Next.js 14 + TypeScript + Tailwind + Zustand
├── backend/           # Express + TypeScript + MongoDB + Redis + BullMQ
└── docker-compose.yml # Redis container setup
```

### System Workflow

```txt
Teacher creates assignment → POST /api/assignments
                                   ↓
                         Job added to BullMQ queue
                                   ↓
                          Worker processes request
                                   ↓
                     Groq LLM generates question paper
                                   ↓
                     Structured JSON response parsed
                                   ↓
                        Data stored in MongoDB
                                   ↓
                  WebSocket updates sent to frontend
                                   ↓
                  Generated paper rendered in UI
```

---

## Features

* AI-powered structured question paper generation
* Automatic answer key generation
* Real-time assignment status tracking using WebSockets
* Redis queue-based background processing with BullMQ
* Assignment regeneration support
* Modular monorepo architecture
* Fully responsive teacher dashboard
* Production deployment with Vercel + Render
* MongoDB Atlas cloud database integration

---

## Tech Stack

| Layer                   | Tech                                          |
| ----------------------- | --------------------------------------------- |
| Frontend                | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend                 | Node.js, Express, TypeScript                  |
| Database                | MongoDB Atlas                                 |
| Queue System            | Redis + BullMQ                                |
| Real-time Communication | WebSockets (`ws`)                             |
| AI Integration          | Groq LLM API                                  |
| Deployment              | Vercel + Render                               |
| Infrastructure          | Docker                                        |

---

## Setup Instructions

### Prerequisites

* Node.js 18+
* Docker & Docker Compose
* Groq API Key
* MongoDB Atlas URI

---

## 1. Clone Repository

```bash
git clone <your-repo>
cd vedaai
```

---

## 2. Install Dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

---

## 3. Configure Environment Variables

### Backend `.env`

```env
PORT=4000
MONGODB_URI=your_mongodb_atlas_uri
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

---

## 4. Start Redis Container

```bash
docker-compose up -d
```

---

## 5. Start Backend

```bash
cd backend
npm run dev
```

---

## 6. Start Worker

```bash
cd backend
npm run worker
```

---

## 7. Start Frontend

```bash
cd frontend
npm run dev
```

Visit:

```txt
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint                          | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/assignments`                | Fetch all assignments                |
| POST   | `/api/assignments`                | Create assignment and enqueue AI job |
| GET    | `/api/assignments/:id`            | Fetch assignment details             |
| DELETE | `/api/assignments/:id`            | Delete assignment                    |
| GET    | `/api/assignments/:id/paper`      | Fetch generated paper                |
| POST   | `/api/assignments/:id/regenerate` | Regenerate question paper            |

---

## WebSocket Events

Connect to:

```txt
wss://vedaai-backend-6s8j.onrender.com/ws
```

### Subscribe

```json
{
  "type": "subscribe",
  "assignmentId": "assignment_id"
}
```

### Events

```json
{
  "type": "status",
  "status": "processing"
}
```

```json
{
  "type": "completed",
  "paperId": "paper_id"
}
```

```json
{
  "type": "failed",
  "message": "Generation failed"
}
```

---

## Deployment

### Frontend Deployment (Vercel)

```bash
cd frontend
npx vercel --prod
```

Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://vedaai-backend-6s8j.onrender.com
NEXT_PUBLIC_WS_URL=wss://vedaai-backend-6s8j.onrender.com/ws
```

---

### Backend Deployment (Render)

* Root Directory: `backend`
* Build Command:

```bash
npm install && npm run build
```

* Start Command:

```bash
npm run start:all
```

Required Environment Variables:

```env
MONGODB_URI=
REDIS_URL=
GROQ_API_KEY=
FRONTEND_URL=
```

---

## Production Architecture

```txt
Vercel Frontend
        ↓
Render Backend + Worker
        ↓
Redis Queue
        ↓
MongoDB Atlas
```

---

## Future Enhancements

* PDF export support
* Teacher authentication system
* Assignment analytics dashboard
* AI difficulty customization
* Multi-language question generation
* Classroom and student management
* Rich text editor for manual editing

---

## Author

Developed and maintained by Anish Agarwal.
