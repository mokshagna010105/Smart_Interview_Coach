# Smart Interview Coach (InterviewAI)

> An AI-powered mock interview and speech coaching platform built with React, Node.js, Express, and MongoDB in **Pure JavaScript**.

---

## System Overview

InterviewAI simulates real-time technical, behavioral, and HR interviews. It extracts candidate skills from resumes, generates personalized interview questions using Google Gemini, transcribes answers in real-time via Web Speech, and computes deterministic rubrics, filler-word diagnostics, and performance trends.

---

## Tech Stack (Pure JavaScript ESM)

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, TanStack Query v5, Lucide React, Recharts.
- **Backend**: Node.js 20+, Express.js (ESM), Mongoose, Socket.io, Argon2/Bcrypt, Multer, Winston.
- **AI & Speech**: Google Gemini API, Web Speech API.

---

## Project Structure

```
interview-ai/
├── package.json          # Root orchestration scripts
├── shared/               # Shared constants & enumerations
├── backend/              # Express REST API, services & middleware
├── frontend/             # React + Vite client application
├── docs/                 # Architectural specifications & database design
└── .env.example          # Environment variables template
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 2. Installation
Install all dependencies across the monorepo:
```bash
npm run install:all
```

### 3. Environment Variables
Copy `.env.example` into `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

### 4. Running the Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run individually:
- **Backend**: `npm run dev:backend` (Runs on `http://localhost:5000`)
- **Frontend**: `npm run dev:frontend` (Runs on `http://localhost:5173`)

### 5. Health Check
- Backend Health Check: `http://localhost:5000/api/v1/health`
- Frontend UI: `http://localhost:5173`
