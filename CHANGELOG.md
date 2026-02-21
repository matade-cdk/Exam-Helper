# Changelog

All notable changes to Exam Helper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-21

### Added
- Initial release of Exam Helper
- Document upload support (PDF, DOCX, TXT)
- Drag and drop file upload interface
- AI-powered document summarization (6-10 bullet points)
- Important exam question generation (8-12 questions)
- Q&A functionality with source citations
- Page number references for all answers
- Download summaries and questions as text files
- Glassmorphism UI design with responsive layout
- Landing page with feature overview
- Backend REST API with 4 endpoints
- RAG implementation using LangChain.js
- OpenAI embeddings via OpenRouter
- In-memory vector store for semantic search
- Smart text chunking with overlap (1000 chars, 150 overlap)
- Automatic file cleanup after processing
- Health check endpoint
- Environment configuration templates
- Comprehensive documentation

### Tech Stack
- Frontend: React 19
- Backend: Node.js + Express
- RAG: LangChain.js + OpenAI (via OpenRouter)
- Vector Store: MemoryVectorStore

### Known Limitations
- Vector store is in-memory (data lost on server restart)
- No user authentication
- No document history or persistence
- Single document processing at a time

## [Unreleased]

### Planned Features
- Persistent vector database (Chroma/Pinecone)
- User authentication and document management
- Multiple document support
- Document comparison features
- Export to PDF format
- Study progress tracking
- Flashcard generation
- Quiz mode with scoring
