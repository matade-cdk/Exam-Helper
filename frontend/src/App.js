import { useRef, useState, useCallback } from "react";
import "./App.css";

/**
 * API base URL - configurable via environment variable
 * Defaults to localhost:4000 for development
 */
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

/**
 * Exam Helper - Main Application Component
 * 
 * Provides document upload with drag & drop, AI-powered summarization,
 * question generation, and Q&A functionality using a RAG backend.
 */
function App() {
  const [view, setView] = useState("landing");
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState("");
  const [docName, setDocName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [importantQuestions, setImportantQuestions] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState({
    upload: false,
    summary: false,
    important: false,
    ask: false
  });
  const howRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const downloadAsTextFile = (title, content) => {
    const header = docName || "Document";
    const text = `${header}\n${"=".repeat(header.length)}\n\n${title}\n${"-".repeat(title.length)}\n\n${content}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${header.replace(/\.[^.]+$/, "")} - ${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Pick a file first.");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    setUploadStatus("Uploading...");
    setSummary("");
    setImportantQuestions("");
    setAnswer("");
    setSources([]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setDocId(data.docId);
      setDocName(data.name);
      setUploadStatus(`Ready: ${data.chunks} study chunks indexed.`);
    } catch (error) {
      setUploadStatus(error.message || "Upload failed.");
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const handleSummary = async () => {
    if (!docId) {
      setSummary("Upload a document first.");
      return;
    }

    setLoading((prev) => ({ ...prev, summary: true }));
    setSummary("Working on the summary...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Summary failed.");
      }

      setSummary(data.answer || "");
    } catch (error) {
      setSummary(error.message || "Summary failed.");
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  const handleImportantQuestions = async () => {
    if (!docId) {
      setImportantQuestions("Upload a document first.");
      return;
    }

    setLoading((prev) => ({ ...prev, important: true }));
    setImportantQuestions("Generating important questions...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/important-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setImportantQuestions(data.answer || "");
    } catch (error) {
      setImportantQuestions(error.message || "Request failed.");
    } finally {
      setLoading((prev) => ({ ...prev, important: false }));
    }
  };

  const handleAsk = async () => {
    if (!docId) {
      setAnswer("Upload a document first.");
      return;
    }
    if (!question.trim()) {
      setAnswer("Type a question first.");
      return;
    }

    setLoading((prev) => ({ ...prev, ask: true }));
    setAnswer("Thinking...");
    setSources([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, question })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ask failed.");
      }

      setAnswer(data.answer || "");
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (error) {
      setAnswer(error.message || "Ask failed.");
    } finally {
      setLoading((prev) => ({ ...prev, ask: false }));
    }
  };

  return (
    <div className="app-shell">
      <nav className="nav">
        <div className="brand">
          <img src="/logo.png" alt="Exam Helper" className="brand-logo" />
        </div>
        <div className="nav-actions">
          {view === "landing" ? (
            <button className="ghost" onClick={() => setView("app")}> 
              Go to workspace
            </button>
          ) : (
            <button className="ghost" onClick={() => setView("landing")}> 
              Back to home
            </button>
          )}
        </div>
      </nav>

      {view === "landing" ? (
        <main className="landing">
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">RAG powered exam prep</p>
              <h1>Turn textbook chapters into exam-ready answers.</h1>
              <p className="lede">
                Upload any study material. Get important questions, crisp
                summaries, and answers grounded in the exact text.
              </p>
              <div className="hero-actions">
                <button className="primary" onClick={() => setView("app")}> 
                  Let&apos;s start
                </button>
                <button
                  className="secondary"
                  onClick={() => howRef.current?.scrollIntoView({
                    behavior: "smooth"
                  })}
                >
                  See how it works
                </button>
              </div>
            </div>
            <div className="hero-card">
              <h3>What you get</h3>
              <ul>
                <li>Upload PDF, DOCX, or TXT</li>
                <li>Important exam questions</li>
                <li>Fast summary with sources</li>
                <li>Ask anything from the text</li>
              </ul>
            </div>
          </section>

          <section className="benefits">
            <div className="benefit">
              <h3>Built for exact answers</h3>
              <p>
                Your professor wants textbook wording. The RAG engine
                prioritizes the exact source text.
              </p>
            </div>
            <div className="benefit">
              <h3>Spot the important parts</h3>
              <p>
                Get 8-12 likely exam questions, shaped from your own
                document.
              </p>
            </div>
            <div className="benefit">
              <h3>Clear, quick summaries</h3>
              <p>
                Summaries that focus on what matters so you revise fast
                without guessing.
              </p>
            </div>
          </section>

          <section className="how" ref={howRef}>
            <div className="how-heading">
              <h2>How it works</h2>
              <p>Three steps to go from upload to answers.</p>
            </div>
            <div className="how-steps">
              <div className="step">
                <span>1</span>
                <h4>Upload the chapter</h4>
                <p>PDF, DOCX, or TXT is supported.</p>
              </div>
              <div className="step">
                <span>2</span>
                <h4>Ask or generate</h4>
                <p>Important questions, answers, and summaries on demand.</p>
              </div>
              <div className="step">
                <span>3</span>
                <h4>Study with sources</h4>
                <p>Every response is grounded in your document.</p>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="workspace">
          <section className="upload-card">
            <div>
              <h2>Upload your document</h2>
              <p>
                Your study workspace will unlock once the file is indexed.
              </p>
            </div>
            <div
              className={`upload-drop-zone${dragOver ? " drag-over" : ""}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                className="file-input-hidden"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(event) => setFile(event.target.files[0])}
              />
              <div className="drop-icon">&#128196;</div>
              <p className="drop-text">
                {file ? file.name : "Drop your file here or click to browse"}
              </p>
              <span className="drop-hint">PDF, DOCX, or TXT</span>
            </div>
            <div className="upload-actions">
              <button
                className="primary upload-btn"
                onClick={handleUpload}
                disabled={loading.upload}
              >
                {loading.upload ? "Uploading..." : "Upload & Index"}
              </button>
            </div>
            <div className="upload-status">
              <strong>{docName || "No file yet"}</strong>
              <span>{uploadStatus}</span>
            </div>
          </section>

          <section className="workspace-grid">
            <div className="panel">
              <h3>Ask a question</h3>
              <p>Type any question and get a grounded answer.</p>
              <div className="panel-actions">
                <input
                  type="text"
                  placeholder="e.g. Explain the main causes of inflation"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                />
                <button
                  className="secondary"
                  onClick={handleAsk}
                  disabled={loading.ask}
                >
                  {loading.ask ? "Answering..." : "Ask"}
                </button>
              </div>
              <div className="panel-output">
                <pre>{answer}</pre>
                {sources.length > 0 && (
                  <div className="sources">
                    <p>Sources</p>
                    <ul>
                      {sources.map((source, index) => (
                        <li key={`${source.source}-${index}`}>
                          {source.source}
                          {source.page ? ` (p.${source.page})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="panel">
              <h3>Important questions</h3>
              <p>Generate likely exam questions from the document.</p>
              <div className="panel-actions-row">
                <button
                  className="secondary"
                  onClick={handleImportantQuestions}
                  disabled={loading.important}
                >
                  {loading.important ? "Generating..." : "Generate"}
                </button>
                {importantQuestions && !loading.important && (
                  <button
                    className="download-btn"
                    onClick={() => downloadAsTextFile("Important Questions", importantQuestions)}
                    title="Download as text file"
                  >
                    &#11015; Download
                  </button>
                )}
              </div>
              <div className="panel-output">
                <pre>{importantQuestions}</pre>
              </div>
            </div>

            <div className="panel">
              <h3>Summary</h3>
              <p>Get a fast summary focused on exam-ready points.</p>
              <div className="panel-actions-row">
                <button
                  className="secondary"
                  onClick={handleSummary}
                  disabled={loading.summary}
                >
                  {loading.summary ? "Summarizing..." : "Generate"}
                </button>
                {summary && !loading.summary && (
                  <button
                    className="download-btn"
                    onClick={() => downloadAsTextFile("Summary", summary)}
                    title="Download as text file"
                  >
                    &#11015; Download
                  </button>
                )}
              </div>
              <div className="panel-output">
                <pre>{summary}</pre>
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <span>Built for students who need exact textbook answers.</span>
      </footer>
    </div>
  );
}

export default App;
