# Exam Helper 📚

AI-powered exam preparation assistant that helps students study more effectively using RAG (Retrieval-Augmented Generation) technology.

## Overview

Exam Helper allows students to upload study materials (PDF, DOCX, TXT) and instantly:
- ✅ Generate comprehensive summaries
- ✅ Create important exam questions  
- ✅ Ask specific questions with source-cited answers

## Features
- Landing page with benefits and how-to
- Document upload (PDF, DOCX, TXT) with drag & drop
- Important question generation (8-12 questions)
- Summary generation (6-10 bullet points)
- Ask questions with sources and page citations
- Download results as text files
- Glassmorphism UI design with responsive layout

## Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **LangChain.js**: RAG orchestration and document processing
- **OpenAI (via OpenRouter)**: Embeddings (text-embedding-3-small) and chat (gpt-4o-mini)
- **Memory Vector Store**: In-memory semantic search

### Frontend
- **React 19**: Modern UI with hooks
- **CSS3**: Custom glassmorphism design
- **Drag & Drop**: Intuitive file upload

## Architecture

```
User uploads document → 
  Express receives file →
  Load document (PDFLoader/DocxLoader/TextLoader) →
  Split into chunks (RecursiveCharacterTextSplitter: 1000 chars, 150 overlap) →
  Generate embeddings (OpenAIEmbeddings) →
  Store in MemoryVectorStore →
  Return docId

User asks question →
  Retrieve top 6 similar chunks (cosine similarity) →
  Stuff chunks into prompt context →
  Generate answer with ChatOpenAI →
  Return answer with source citations
```

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
