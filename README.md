# VedaAI – AI-Powered Assessment Generation Platform

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express.js-Node.js-green?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb\&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis\&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-orange)
![Groq](https://img.shields.io/badge/AI-Groq_LLM-purple)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

---

## Live Demo

**Frontend**

https://vedaai-frontend-brown.vercel.app

**Backend Health Check**

https://vedaai-backend-vc0h.onrender.com/api/health

---

# Overview

VedaAI is a production-ready AI-powered assessment generation platform that enables educators to create structured examination papers from uploaded study material within seconds.

The platform leverages Large Language Models (Groq LLM), BullMQ, Redis, MongoDB Atlas, and WebSockets to generate question papers asynchronously while providing real-time progress updates. Instead of waiting synchronously for AI responses, requests are processed through a background job queue, resulting in a scalable and responsive architecture.

---

# Features

* AI-powered structured question paper generation
* Automatic answer key generation
* Context-aware assessment creation from uploaded study material
* Real-time assignment progress tracking using WebSockets
* Redis-backed asynchronous job processing with BullMQ
* Assignment regeneration support
* Assignment history management
* Email and Google OAuth authentication
* JWT-based authentication with refresh tokens
* Fully responsive teacher dashboard
* Production deployment using Vercel and Render
* MongoDB Atlas cloud database integration

---

# Screenshots

Replace the placeholders below with application screenshots.

## Dashboard

```text
screenshots/dashboard.png
```

## Assignment Creation

```text
screenshots/create-assignment.png
```

## Generated Question Paper

```text
screenshots/question-paper.png
```

---

# Tech Stack

| Layer                   | Technologies                                         |
| ----------------------- | ---------------------------------------------------- |
| Frontend                | Next.js 14, React, TypeScript, Tailwind CSS, Zustand |
| Backend                 | Node.js, Express.js, TypeScript                      |
| Database                | MongoDB Atlas                                        |
| Queue System            | Redis, BullMQ                                        |
| Authentication          | JWT, Google OAuth 2.0                                |
| Real-time Communication | WebSockets (`ws`)                                    |
| AI Integration          | Groq LLM API                                         |
| Deployment              | Vercel, Render                                       |
| Infrastructure          | Docker                                               |

---

# Architecture

```text
                    +---------------------------+
                    |     Next.js Frontend      |
                    +------------+--------------+
                                 |
                      REST API + WebSockets
                                 |
                    +------------v--------------+
                    |      Express Backend      |
                    +------------+--------------+
                                 |
               +-----------------+----------------+
               |                                  |
         MongoDB Atlas                    Redis Queue
               |                                  |
               |                           BullMQ Jobs
               |                                  |
               +-----------------+----------------+
                                 |
                        Integrated Worker
                                 |
                          Groq LLM API
                                 |
                     Generated Question Paper
```

---

# System Workflow

```text
Teacher creates assignment
            │
            ▼
POST /api/assignments
            │
            ▼
Assignment stored in MongoDB
            │
            ▼
Job added to BullMQ Queue
            │
            ▼
Integrated Worker processes job
            │
            ▼
Groq LLM generates question paper
            │
            ▼
Structured JSON parsed
            │
            ▼
Question paper stored in MongoDB
            │
            ▼
WebSocket sends live updates
            │
            ▼
Generated paper displayed in the frontend
```

---

# Project Structure

```text
vedaai
│
├── frontend
│   ├── app
│   ├── components
│   ├── hooks
│   ├── lib
│   ├── store
│   └── public
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── lib
│   │   ├── worker.ts
│   │   └── index.ts
│   │
│   └── uploads
│
├── docker-compose.yml
├── README.md
└── package.json
```

---

# Authentication

The application supports:

* Email and Password Authentication
* Google OAuth 2.0 Authentication

Security features include:

* JWT Access Tokens
* Refresh Token Rotation
* Secure HttpOnly Cookies
* Password Hashing using bcrypt
* Protected API Routes

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Anni27-hub/vedaai.git

cd vedaai
```

---

## Install Dependencies

Frontend

```bash
cd frontend
npm install
```

Backend

```bash
cd ../backend
npm install
```

---

# Environment Variables

## Backend (.env)

```env
PORT=4000
NODE_ENV=development

MONGODB_URI=
REDIS_URL=redis://localhost:6379

GROQ_API_KEY=
JWT_SECRET=
GOOGLE_CLIENT_ID=

FRONTEND_URL=http://localhost:3000
```

---

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

# Running Locally

## Start Redis

```bash
docker-compose up -d
```

---

## Start Backend

```bash
cd backend

npm run dev
```

The BullMQ worker starts automatically with the backend.

---

## Start Frontend

```bash
cd frontend

npm run dev
```

Application URL

```text
http://localhost:3000
```

---

# REST API

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/api/auth/signup`                | Register a new user       |
| POST   | `/api/auth/login`                 | Login user                |
| POST   | `/api/auth/google`                | Google OAuth login        |
| POST   | `/api/auth/logout`                | Logout user               |
| GET    | `/api/assignments`                | Fetch all assignments     |
| POST   | `/api/assignments`                | Create assignment         |
| GET    | `/api/assignments/:id`            | Fetch assignment details  |
| DELETE | `/api/assignments/:id`            | Delete assignment         |
| GET    | `/api/assignments/:id/paper`      | Fetch generated paper     |
| POST   | `/api/assignments/:id/regenerate` | Regenerate question paper |

---

# WebSocket

Connection URL

```text
wss://vedaai-backend-vc0h.onrender.com/ws
```

Subscription

```json
{
  "type": "subscribe",
  "assignmentId": "assignment_id"
}
```

Events

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

# Deployment

## Frontend

Platform

```text
Vercel
```

Environment Variables

```env
NEXT_PUBLIC_API_URL=https://vedaai-backend-vc0h.onrender.com

NEXT_PUBLIC_WS_URL=wss://vedaai-backend-vc0h.onrender.com/ws

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## Backend

Platform

```text
Render
```

Build Command

```bash
npm install && npm run build
```

Start Command

```bash
npm run start
```

Environment Variables

```env
NODE_ENV=production

MONGODB_URI=
REDIS_URL=
GROQ_API_KEY=
JWT_SECRET=
GOOGLE_CLIENT_ID=

FRONTEND_URL=https://vedaai-frontend-brown.vercel.app
```

---

# Production Architecture

```text
                 Vercel Frontend
                        │
                        ▼
              Render Express Backend
                        │
        ┌───────────────┼───────────────┐
        ▼                               ▼
 MongoDB Atlas                   Redis Queue
                                        │
                                        ▼
                              Integrated BullMQ Worker
                                        │
                                        ▼
                                  Groq LLM API
```

---

# Future Enhancements

* PDF export support
* Rich text editor for manual editing
* AI difficulty customization
* Bloom's Taxonomy-based question generation
* Multi-language assessment generation
* Classroom and student management
* Assignment analytics dashboard
* Role-based access control
* Email notifications

---

# Author

**Anish Agarwal**

Master of Computer Applications
Birla Institute of Technology, Mesra

GitHub: https://github.com/Anni27-hub

---

# License

This project is licensed under the MIT License.
