/**
 * Exam Helper Backend API Server
 * 
 * Express server providing RAG-powered endpoints for document upload,
 * summarization, question generation, and Q&A functionality.
 */

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import {
  answerQuestion,
  buildVectorStoreFromFile,
  generateImportantQuestions,
  summarizeDocument
} from "./rag.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Upload document and create vector store
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const result = await buildVectorStoreFromFile(
      req.file.path,
      req.file.originalname
    );

    fs.unlink(req.file.path, () => {});

    return res.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message || "Upload failed." });
  }
});

// Generate document summary
app.post("/api/summary", async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.status(400).json({ error: "docId is required." });
    }

    const result = await summarizeDocument(docId);
    return res.json(result);
  } catch (error) {
    console.error("Summary error:", error);
    return res.status(500).json({ error: error.message || "Summary failed." });
  }
});

// Generate important exam questions
app.post("/api/important-questions", async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.status(400).json({ error: "docId is required." });
    }

    const result = await generateImportantQuestions(docId);
    return res.json(result);
  } catch (error) {
    console.error("Important questions error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Request failed." });
  }
});

// Answer a specific question about the document
app.post("/api/ask", async (req, res) => {
  try {
    const { docId, question } = req.body;
    if (!docId || !question) {
      return res
        .status(400)
        .json({ error: "docId and question are required." });
    }

    const result = await answerQuestion(docId, question);
    return res.json(result);
  } catch (error) {
    console.error("Ask error:", error);
    return res.status(500).json({ error: error.message || "Ask failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
