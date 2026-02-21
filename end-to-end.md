# Exam Helper — End-to-End Project Documentation

## 1. Project Overview

**Exam Helper** is a full-stack RAG (Retrieval-Augmented Generation) web application that helps students prepare for exams. Users upload study materials (PDF, DOCX, or TXT), and the app uses LangChain + OpenAI models (via OpenRouter) to:

- Generate **8–12 important exam questions** from the uploaded document
- Create a **concise summary** in bullet points
- Answer **any custom question** grounded in the document text with source citations

**Tech Stack:**
- **Frontend:** React 19 (Create React App)
- **Backend:** Node.js + Express (ES Modules)
- **AI/RAG:** LangChain.js (v0.3) with OpenAI-compatible models via OpenRouter
- **Vector Store:** In-memory (MemoryVectorStore)
- **File Handling:** Multer (upload), pdf-parse, mammoth (DOCX)

---

## 2. Architecture & Data Flow

```
User Browser (React)
      │
      ▼
  POST /api/upload  ──►  Express + Multer receives file
                              │
                              ▼
                         PDFLoader / DocxLoader / TextLoader
                              │
                              ▼
                     RecursiveCharacterTextSplitter
                       (chunkSize: 1000, overlap: 150)
                              │
                              ▼
                     OpenAIEmbeddings (text-embedding-3-small)
                              │
                              ▼
                     MemoryVectorStore.fromDocuments()
                       stores chunks + embeddings in RAM
                              │
                              ▼
                     Returns { docId, name, chunks }
                              │
      ◄───────────────────────┘

  POST /api/summary | /api/important-questions | /api/ask
      │
      ▼
  retriever.getRelevantDocuments(query)  ──► top 6 chunks by cosine similarity
      │
      ▼
  createStuffDocumentsChain({ llm, prompt })
      │
      ▼
  ChatOpenAI (gpt-4o-mini via OpenRouter, temp 0.2)
      │
      ▼
  Returns { answer, sources[] }
```

---

## 3. Backend — Detailed Breakdown

### 3.1 server.js — Express API Server

**Purpose:** HTTP server that handles file uploads and proxies AI requests.

**Key components:**
- **Multer** for multipart file uploads → saves to `uploads/` directory with timestamp prefix
- **CORS enabled** for cross-origin requests from React dev server (port 3000 → 4000)
- **4 API endpoints:**

| Endpoint | Method | Body | What it does |
|---|---|---|---|
| `/api/health` | GET | — | Health check, returns `{ status: "ok" }` |
| `/api/upload` | POST | `FormData` with `file` | Uploads file, builds vector store, returns `docId` |
| `/api/summary` | POST | `{ docId }` | Generates 6–10 bullet point summary |
| `/api/important-questions` | POST | `{ docId }` | Generates 8–12 exam questions |
| `/api/ask` | POST | `{ docId, question }` | Answers a custom question with sources |

**After upload:** The file is deleted from disk (`fs.unlink`) — only the vector store (in-memory) remains.

### 3.2 rag.js — The RAG Engine (Core AI Logic)

This is the heart of the application. Here's what each part does:

#### 3.2.1 Configuration (`getClientConfig`)
- Reads `OPENROUTER_API_KEY` from `.env`
- Uses OpenRouter as the base URL (`https://openrouter.ai/api/v1`)
- Default chat model: `openai/gpt-4o-mini`
- Default embedding model: `text-embedding-3-small`

#### 3.2.2 Document Loading (`loadDocuments`)
- Detects file extension (`.pdf`, `.docx`, `.txt`)
- Uses the appropriate LangChain loader:
  - `PDFLoader` from `@langchain/community` — uses `pdf-parse` under the hood
  - `DocxLoader` from `@langchain/community` — uses `mammoth` to extract text from .docx
  - `TextLoader` from `langchain` — reads plain text files
- Attaches `sourceName` metadata (original filename) to every document chunk

#### 3.2.3 Vector Store Construction (`buildVectorStoreFromFile`)

This is the **indexing step** — happens once per upload:

1. **Load** the document into LangChain `Document` objects
2. **Split** using `RecursiveCharacterTextSplitter`:
   - `chunkSize: 1000` characters per chunk
   - `chunkOverlap: 150` characters overlap between consecutive chunks
   - Why overlap? So context isn't lost at chunk boundaries
3. **Embed** each chunk using `OpenAIEmbeddings` → produces a numerical vector (array of floats) for each chunk
4. **Store** in `MemoryVectorStore` — an in-memory vector database that supports cosine similarity search
5. **Generate** a UUID (`crypto.randomUUID()`) as the `docId`
6. **Return** `{ docId, name, chunks }` to the frontend

#### 3.2.4 RAG Query Pipeline (`runPrompt`)

This is the **retrieval + generation step** — happens for every question/summary/important-questions request:

1. **Retrieve:** `store.asRetriever(6)` creates a retriever that fetches top 6 most similar chunks
   - Uses cosine similarity between the query embedding and stored chunk embeddings
2. **Construct prompt:** `ChatPromptTemplate.fromMessages()` builds a prompt with:
   - System message: task instruction + `{context}` placeholder
   - Human message: `{input}` (the user's query)
3. **Chain:** `createStuffDocumentsChain` "stuffs" all retrieved chunks into the `{context}` variable
   - This is the simplest RAG chain — all chunks go into one prompt
4. **Invoke:** Sends the full prompt to the LLM (gpt-4o-mini via OpenRouter)
5. **Return:** The LLM's answer + source metadata (filename, page numbers)

#### 3.2.5 Three Exported Functions

| Function | Input sent to LLM | System Prompt |
|---|---|---|
| `summarizeDocument(docId)` | "Summarize the document for exam study in 6-10 bullet points." | "You are a study assistant. Use the provided context only." |
| `generateImportantQuestions(docId)` | "Create 8-12 important exam questions. Output a numbered list." | "You are a study assistant. Use the provided context only." |
| `answerQuestion(docId, question)` | The user's actual question | "Answer using only the context. If the answer is not in the context, say you do not know." |

### 3.3 Key LangChain Packages Used

| Package | Version | Purpose |
|---|---|---|
| `langchain` | ^0.3.13 | Core chains, TextLoader, MemoryVectorStore |
| `@langchain/core` | ^0.3.58 | Prompt templates, base abstractions |
| `@langchain/openai` | ^0.4.4 | ChatOpenAI (LLM) + OpenAIEmbeddings |
| `@langchain/community` | ^0.3.14 | PDFLoader, DocxLoader |
| `@langchain/textsplitters` | ^0.1.0 | RecursiveCharacterTextSplitter |

### 3.4 Other Backend Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server framework |
| `cors` | Enable cross-origin requests |
| `multer` | Handle multipart file uploads |
| `dotenv` | Load `.env` variables |
| `pdf-parse` | PDF text extraction (used by PDFLoader) |
| `mammoth` | DOCX text extraction (used by DocxLoader) |

---

## 4. Frontend — Detailed Breakdown

### 4.1 Tech & Structure
- **React 19** with Create React App
- Single component (`App.js`) with state-driven views
- CSS-only styling (no UI library) with glassmorphism design
- Two views: **Landing page** and **Workspace**

### 4.2 State Management

All state lives in `App.js` using `useState`:

| State | Purpose |
|---|---|
| `view` | Toggles between `"landing"` and `"app"` (workspace) |
| `file` | The selected `File` object before upload |
| `docId` | UUID returned after upload — used for all subsequent API calls |
| `docName` | Original filename for display |
| `uploadStatus` | Status message like "Ready: 42 study chunks indexed." |
| `summary` | The generated summary text |
| `importantQuestions` | The generated questions text |
| `question` | The user's typed question |
| `answer` | The LLM's answer to the user's question |
| `sources` | Array of `{ source, page }` for citations |
| `loading` | Object with `upload`, `summary`, `important`, `ask` booleans |
| `dragOver` | Whether a file is being dragged over the drop zone |

### 4.3 Key Features

#### Drag & Drop File Upload
- Custom drop zone with `onDrop`, `onDragOver`, `onDragLeave` handlers
- Hidden `<input type="file">` triggered via `useRef`
- Visual feedback on drag-over (accent glow, slight scale)
- Shows selected filename before upload

#### Download Results
- `downloadAsTextFile(title, content)` function creates a `.txt` file on the fly:
  - Header = PDF filename
  - Section title = "Important Questions" or "Summary"
  - Body = the generated content
- Uses `Blob` + `URL.createObjectURL` + programmatic `<a>` click
- Download button appears only after content is generated

#### Source Citations
- Every answer shows source file name + page number
- Rendered as a list under the answer in the "Ask a question" panel

### 4.4 API Communication

All API calls use `fetch()` with:
- `POST` method
- `Content-Type: application/json` (except upload which uses `FormData`)
- Base URL configurable via `REACT_APP_API_BASE_URL` env var (defaults to `http://localhost:4000`)

### 4.5 UI/UX Design

- **Theme:** Warm sand/cream palette with CSS custom properties (`--sand-*`, `--ink-*`, `--accent`)
- **Glassmorphism:** Panels use `backdrop-filter: blur()` with semi-transparent backgrounds
- **Animations:** `fadeIn`, `slideUp` keyframes; hover lifts on cards/buttons
- **Typography:** Palatino serif for headings, Segoe UI/Trebuchet sans-serif for body
- **Responsive:** Grid layouts with `auto-fit` + `minmax()`, mobile breakpoint at 720px
- **Custom logo** in the nav bar

---

## 5. How RAG Works (Interview Explanation)

**RAG = Retrieval-Augmented Generation**

The problem with plain LLMs: they only know their training data. They can't answer questions about YOUR specific document.

**RAG solves this in 2 phases:**

### Phase 1: Indexing (happens at upload)
1. **Load** the document → extract raw text
2. **Split** into chunks (~1000 chars each with 150 char overlap)
3. **Embed** each chunk → convert text into a high-dimensional vector (array of numbers) using an embedding model
4. **Store** vectors in a vector database (we use MemoryVectorStore — in-RAM)

### Phase 2: Querying (happens at every question)
1. **Embed the question** → same embedding model, same vector space
2. **Similarity search** → find the top-K chunks whose vectors are closest to the question vector (cosine similarity)
3. **Stuff into prompt** → put those chunks as "context" in the LLM prompt
4. **Generate** → the LLM reads the context and generates an answer grounded in the actual document text
5. **Return with sources** → include page numbers so the user can verify

### Why "Stuff" Chain?
- Simplest approach: concatenate all retrieved chunks into one prompt
- Works well when chunks fit within the model's context window
- Alternatives: MapReduce chain (for very large documents), Refine chain

---

## 6. Key Technical Decisions & Interview Talking Points

### Why OpenRouter instead of direct OpenAI?
- OpenRouter provides a unified API to access multiple LLM providers
- Same OpenAI-compatible API format, just a different base URL
- Can switch models (GPT-4o, Claude, Llama, etc.) without code changes

### Why MemoryVectorStore?
- Zero infrastructure — no database to set up
- Good for prototyping and single-user use
- Limitation: data is lost on server restart (not persistent)
- Production alternative: Pinecone, Chroma, Weaviate, pgvector

### Why RecursiveCharacterTextSplitter?
- Tries to split at natural boundaries (paragraphs → sentences → words)
- Better than naive fixed-size splitting which can cut mid-sentence
- `chunkOverlap: 150` ensures context continuity between chunks

### Why temperature 0.2?
- Low temperature = more deterministic, factual responses
- Important for exam prep where accuracy matters
- Higher temperature would add more creativity/randomness (bad for study answers)

### Why cosine similarity?
- Standard metric for comparing embedding vectors
- Measures the angle between vectors, not magnitude
- Works well for semantic similarity (meaning-based, not keyword-based)

---

## 7. Project Structure

```
Exam_helper/
├── image.png                 # Logo image
├── end-to-end.md             # This file
├── README.md
├── backend/
│   ├── package.json          # Dependencies + "type": "module" (ESM)
│   ├── .env                  # OPENROUTER_API_KEY (not committed)
│   ├── server.js             # Express API server (4 endpoints)
│   ├── rag.js                # RAG engine (LangChain logic)
│   └── uploads/              # Temporary file storage (auto-created)
├── frontend/
│   ├── package.json
│   ├── public/
│   │   ├── index.html        # Entry HTML with favicon
│   │   ├── logo.png          # Nav logo
│   │   ├── image.png         # Favicon source
│   │   └── manifest.json
│   └── src/
│       ├── App.js            # Main React component (all logic)
│       ├── App.css           # Component styles (glassmorphism)
│       ├── index.js           # React entry point
│       └── index.css          # Global styles + CSS variables
```

---

## 8. How to Run

```bash
# Backend
cd backend
cp .env.example .env          # Add your OPENROUTER_API_KEY
npm install
npm start                     # Runs on http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm start                     # Runs on http://localhost:3000
```

---

## 9. Common Interview Q&A

**Q: What is RAG and why did you use it?**
A: RAG combines retrieval (searching your own documents) with generation (LLM producing answers). Without RAG, the LLM can only use its training data. With RAG, it answers from YOUR specific uploaded document.

**Q: How do embeddings work?**
A: An embedding model converts text into a fixed-size numerical vector. Similar texts produce similar vectors. We embed both document chunks and the user's question, then find chunks closest to the question using cosine similarity.

**Q: What is a vector store?**
A: A database optimized for storing and searching high-dimensional vectors. We use MemoryVectorStore (in-RAM, fast, but not persistent). Production apps use Pinecone, Chroma, or pgvector.

**Q: What is chunking and why is overlap important?**
A: Large documents must be split into smaller pieces (chunks) that fit in the LLM context window. Overlap ensures important information at chunk boundaries isn't lost.

**Q: What does `createStuffDocumentsChain` do?**
A: It takes retrieved document chunks and "stuffs" them all into the prompt's `{context}` variable, then sends the complete prompt to the LLM. It's the simplest document chain in LangChain.

**Q: Why did you choose gpt-4o-mini?**
A: It's fast, cheap, and good enough for summarization and Q&A tasks. For production, you could swap to GPT-4o or Claude for higher quality.

**Q: How do you handle large files?**
A: The text splitter breaks any size document into manageable chunks. Only the top-K most relevant chunks are sent to the LLM, keeping the prompt within context limits.

**Q: What happens if the answer isn't in the document?**
A: The system prompt instructs the LLM to say "I do not know" if the answer isn't in the provided context. This prevents hallucination.
