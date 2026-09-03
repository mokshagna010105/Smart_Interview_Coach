# InterviewAI — Smart Interview Coach

> An intelligent, full-stack mock interview and speech coaching platform that bridges the gap between preparation and real-world tech job offers.

---

## 🌟 System Overview

**InterviewAI** simulates real-world Technical, Behavioral (STAR method), HR & Culture Fit, and System Architecture Case Study interviews. It extracts candidate skills from uploaded resumes (PDF, DOCX, TXT), dynamically generates tailored questions using Google Gemini or high-fidelity deterministic generators, captures candidate answers in real time via speech-to-text with optional webcam preview, evaluates answers across 5 granular rubrics, detects conversational filler words, and delivers longitudinal progress analytics.

---

## 🏗️ Architecture & Data Flow

```
[Candidate Browser] (React + Vite + Tailwind CSS)
       │
       ├─► Web Speech API (Live voice speech-to-text)
       ├─► MediaDevices API (Modular webcam preview)
       ├─► Recharts (Score trends, type distribution, readiness)
       │
       ▼ [HTTPS REST / WSS Socket.io]
[Node.js / Express Backend (ES Modules)]
       │
       ├─► Helmet, CORS, Rate Limiters, Zod Input Validation
       ├─► JWT Authentication & RBAC (USER, ADMIN)
       │
       ▼
[Interview State Machine Service]
  (CREATED ──► READY ──► IN_PROGRESS ◄──► PAUSED ──► COMPLETED / ABANDONED)
       │
       ├─► [AI Provider Layer]
       │     ├── GeminiProvider (Structured JSON output via Gemini 1.5/2.0)
       │     └── Deterministic Generators (Offline & fault-tolerant rule-based fallback)
       │
       ├─► [Analytics & Report Engine]
       │     ├── 5-Dimension Rubrics (Relevance, Correctness, Completeness, Communication, Clarity)
       │     ├── Deterministic Filler Word Detector
       │     ├── Ideal Reference Answers
       │     └── Shareable Verified Scorecards (Secure tokenized public URLs)
       │
       ├─► [Email Service] (Nodemailer SMTP abstraction with development logger)
       │
       ▼
[MongoDB / Mongoose 8 Database]
  ├── Users & Profiles
  ├── Resumes (Parsed skills, text & metadata)
  ├── Interviews & Question Banks
  ├── Interview Answers & Evaluations
  ├── Interview Reports
  └── User Feedback
```

---

## 🚀 Key Features

1. **AI Question Generation with Resilient Fallback**: Tailored to target role, difficulty tier, target company (Google, Amazon, Meta, etc.), and candidate skills. Seamlessly uses rule-based question banks if no API key is provided.
2. **Real-Time Speech Transcription & Dual Mode Answering**: Natural voice answering with continuous live transcription, as well as keyboard text input.
3. **Webcam Video Preview Cockpit**: Realistic interview room with live video tile, countdown timer, pause/resume, and question skip actions.
4. **5-Dimension Rubric Scoring & Ideal Answers**: Evaluates Technical Correctness, Question Relevance, Completeness, Communication, and Clarity with domain-accurate sample answers.
5. **Deterministic Filler Word Analysis**: Automatically counts occurrences and calculates density percentages of words such as *um, uh, like, you know, actually, basically*.
6. **Shareable & Printable Scorecards**: Generates secure, tokenized public report links and printable PDF-ready summary scorecards.
7. **Longitudinal Progress Analytics**: Interactive Recharts graphs showing score progression over time, performance by interview track, and competency heatmaps.
8. **Multi-Format Resume Parser**: Upload PDF, DOCX, or TXT resumes with automatic skill and project extraction.
9. **Role-Based Admin Console**: Administrative dashboard tracking total users, mock interview volume, platform score averages, and user feedback stream.
10. **Hardened Security & Enumeration Defense**: SHA-256 password reset tokens, JWT access/refresh rotation, rate limiting, and generic auth responses.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack React Query v5, React Router v6, Recharts, Lucide React, Socket.io Client.
- **Backend**: Node.js 20+, Express.js (ES Modules), Mongoose 8, Socket.io, Zod, Nodemailer, Express-Rate-Limit, Helmet, Winston.
- **AI & Integrations**: Google Gemini API, Web Speech API, PDF-Parse v2, Mammoth DOCX.
- **Database**: MongoDB 7+.
- **DevOps**: Docker, Docker Compose, Multi-stage Nginx builds.

---

## 📦 Project Structure

```
Smart_Interview_Coach_V2/
├── package.json               # Monorepo orchestration scripts
├── docker-compose.yml         # Containerized production deployment
├── shared/                    # Shared constants (statuses, types, roles, difficulties)
├── backend/                   # Express REST API & WebSocket server
│   ├── src/
│   │   ├── config/            # Database & environment variables
│   │   ├── controllers/       # Auth, Interview, Evaluation, Analytics, Admin
│   │   ├── integrations/ai/   # GeminiProvider & Deterministic Fallbacks
│   │   ├── middleware/        # Auth, RBAC, Validation, Rate Limit, Error handling
│   │   ├── models/            # Mongoose Schemas (User, Interview, Question, Report, etc.)
│   │   ├── routes/            # Express v1 domain routes
│   │   ├── services/          # State machine, Email, Parser, Analytics logic
│   │   ├── utils/             # Token utilities, Logger, Filler word detector
│   │   └── websocket/         # Socket.io real-time coordinator
│   ├── test/                  # Automated integration test suites (49 passing tests)
│   └── Dockerfile
└── frontend/                  # React + Vite client SPA
    ├── src/
    │   ├── api/               # Axios client with auto-refresh interceptors
    │   ├── components/        # Common UI, Header, Footer, Modals
    │   ├── contexts/          # AuthContext with token lifecycle
    │   ├── pages/             # Landing, Setup, Room, Report, Analytics, Admin
    │   └── services/          # Web Speech API provider
    ├── nginx.conf
    └── Dockerfile
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **MongoDB**: Running locally on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Environment Variables
```bash
# Backend Environment
cp backend/.env.example backend/.env

# Frontend Environment
cp frontend/.env.example frontend/.env
```

*Note: The platform functions completely offline out-of-the-box using deterministic rule-based question generation and answer evaluation. To enable live Google Gemini AI, simply add your `GEMINI_API_KEY` into `backend/.env`.*

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Backend Health Endpoint**: `http://localhost:5000/api/v1/health`

---

## 🧪 Running Automated Tests

InterviewAI includes comprehensive automated integration test suites:
```bash
npm --prefix backend test
```
**Test Coverage Includes:**
- Block 1: Authentication, JWT Refresh Rotation, User Profile, TXT & PDF Resume parsing.
- Block 2: Interview Configuration, Question Bank Generation, State Machine Transitions, Answering, Skipping, Completion, Abandonment.
- Block 3: Answer Evaluation, 5-Dimension Rubrics, Filler-Word Density Analysis, Report Card Generation, Real Database Analytics.
- Block 4: Tokenized Report Sharing & Revocation, Public Viewer Endpoints, User Feedback, Admin RBAC & Platform Telemetry, SHA-256 Password Reset.

**Frontend Production Build Verification:**
```bash
npm --prefix frontend run build
```

---

## 🐳 Docker Deployment

To spin up the entire application stack (Frontend, Backend, and MongoDB) with a single command:
```bash
docker compose up --build -d
```
- Access Frontend on `http://localhost:80`
- Access Backend API on `http://localhost:5000/api/v1`

---

## 🛡️ Security & Privacy Architecture

- **No Exposure of API Keys**: AI Provider API keys remain strictly server-side.
- **Resource Ownership Guards**: Every interview, answer, and private report enforces strict candidate ownership verification (`403 Forbidden` on cross-tenant access).
- **Secure Share Tokens**: Publicly shared reports use high-entropy random tokens that reveal zero database user IDs or passwords, with instant revocation capability.
- **Rate Limiting**: Defends authentication endpoints from brute-force attempts and protects AI endpoints from runaway usage.
- **Account Enumeration Defense**: Generic password-reset messaging prevents attackers from confirming whether an email exists on the platform.

---

## 📄 License
MIT © 2026 InterviewAI. All rights reserved.
