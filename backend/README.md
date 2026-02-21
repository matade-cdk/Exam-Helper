# Exam Helper - Backend API

RESTful API service for the Exam Helper application. Provides RAG (Retrieval-Augmented Generation) powered endpoints for document processing and Q&A.

## Features

- **Document Upload**: Support for PDF, DOCX, and TXT files
- **Smart Chunking**: Automatic text splitting with overlap for context preservation
- **Vector Search**: Semantic similarity search using OpenAI embeddings
- **AI-Powered Responses**: Generate summaries, important questions, and answers

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini
OPENROUTER_EMBEDDING_MODEL=text-embedding-3-small
PORT=4000
```

## Usage

```bash
npm start
```

Server runs on `http://localhost:4000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Upload Document
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (PDF/DOCX/TXT)

Response: { docId, name, chunks }
```

### Generate Summary
```
POST /api/summary
Content-Type: application/json
Body: { docId }

Response: { answer, sources }
```

### Generate Important Questions
```
POST /api/important-questions
Content-Type: application/json
Body: { docId }

Response: { answer, sources }
```

### Ask Question
```
POST /api/ask
Content-Type: application/json
Body: { docId, question }

Response: { answer, sources }
```

## Technology Stack

- **Express.js**: Web framework
- **LangChain**: RAG orchestration
- **OpenAI**: Embeddings and chat models (via OpenRouter)
- **Multer**: File upload handling
- **Memory Vector Store**: In-memory vector database

## File Structure

```
backend/
├── server.js      # Express API server and route handlers
├── rag.js         # RAG engine with LangChain integration
├── package.json   # Dependencies and scripts
└── uploads/       # Temporary file storage (auto-created)
```
