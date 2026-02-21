# Exam Helper

A study web app that lets students upload a document and generate exam-ready summaries, important questions, and grounded answers using RAG with LangChain and OpenRouter.

## Features
- Landing page with benefits and how-to
- Document upload (PDF, DOCX, TXT)
- Important question generation
- Summary generation
- Ask questions with sources

## Tech Stack
- Frontend: React (Create React App)
- Backend: Node.js + Express
- RAG: LangChain + OpenRouter

## Setup

### Backend
1. Copy the env file:
   - backend/.env.example to backend/.env
2. Add your OpenRouter key in backend/.env.
3. Install dependencies and start:
   - cd backend
   - npm install
   - npm run dev

Backend runs at http://localhost:4000

### Frontend
1. Copy the env file:
   - frontend/.env.example to frontend/.env
2. Install dependencies and start:
   - cd frontend
   - npm install
   - npm start

Frontend runs at http://localhost:3000

## API Endpoints
- POST /api/upload (multipart form-data: file)
- POST /api/summary { docId }
- POST /api/important-questions { docId }
- POST /api/ask { docId, question }

## Notes
- The vector store is in-memory for now. Restarting the backend clears uploaded documents.
- OpenRouter models can be changed in backend/.env.
