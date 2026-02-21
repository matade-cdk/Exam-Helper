import crypto from "crypto";
import path from "path";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const vectorStores = new Map();
const docMeta = new Map();

function getClientConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }

  return {
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    chatModel:
      process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini",
    embeddingModel:
      process.env.OPENROUTER_EMBEDDING_MODEL || "text-embedding-3-small"
  };
}

function createEmbeddings() {
  const { apiKey, baseURL, embeddingModel } = getClientConfig();
  return new OpenAIEmbeddings({
    apiKey,
    model: embeddingModel,
    configuration: { baseURL }
  });
}

function createChatModel() {
  const { apiKey, baseURL, chatModel } = getClientConfig();
  return new ChatOpenAI({
    apiKey,
    model: chatModel,
    temperature: 0.2,
    configuration: { baseURL }
  });
}

function getVectorStore(docId) {
  const store = vectorStores.get(docId);
  if (!store) {
    throw new Error("Unknown document. Upload again.");
  }
  return store;
}

function formatSources(docs) {
  return docs.map((doc) => {
    const page = doc.metadata?.loc?.pageNumber;
    return {
      source: doc.metadata?.sourceName || doc.metadata?.source || "document",
      page: page || null
    };
  });
}

async function loadDocuments(filePath, originalName) {
  const extension = path.extname(filePath).toLowerCase();
  let loader;

  if (extension === ".pdf") {
    loader = new PDFLoader(filePath);
  } else if (extension === ".docx") {
    loader = new DocxLoader(filePath);
  } else if (extension === ".txt") {
    loader = new TextLoader(filePath);
  } else {
    throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
  }

  const docs = await loader.load();
  docs.forEach((doc) => {
    doc.metadata = {
      ...doc.metadata,
      sourceName: originalName
    };
  });

  return docs;
}

export async function buildVectorStoreFromFile(filePath, originalName) {
  const rawDocs = await loadDocuments(filePath, originalName);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150
  });
  const splitDocs = await splitter.splitDocuments(rawDocs);
  const store = await MemoryVectorStore.fromDocuments(
    splitDocs,
    createEmbeddings()
  );

  const docId = crypto.randomUUID();
  vectorStores.set(docId, store);
  docMeta.set(docId, {
    name: originalName,
    chunks: splitDocs.length
  });

  return {
    docId,
    name: originalName,
    chunks: splitDocs.length
  };
}

async function runPrompt(docId, input, systemPrompt) {
  const store = getVectorStore(docId);
  const retriever = store.asRetriever(6);
  const docs = await retriever.getRelevantDocuments(input);

  // Debug: log retrieved chunks so we can verify context quality
  console.log(`\n--- Retrieved ${docs.length} chunks for: "${input}" ---`);
  docs.forEach((doc, i) => {
    console.log(`Chunk ${i + 1} (page ${doc.metadata?.loc?.pageNumber || '?'}): ${doc.pageContent.substring(0, 120)}...`);
  });

  const llm = createChatModel();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt + "\n\nUse the following context to answer. Read it carefully.\n\nContext:\n{context}"],
    ["human", "{input}"]
  ]);

  const chain = await createStuffDocumentsChain({
    llm,
    prompt
  });

  const result = await chain.invoke({
    input,
    context: docs
  });

  const text = typeof result === "string" ? result : result?.text || String(result);
  return {
    answer: text,
    sources: formatSources(docs)
  };
}

export async function summarizeDocument(docId) {
  return runPrompt(
    docId,
    "Summarize the document for exam study in 6-10 bullet points.",
    "You are a study assistant. Use the provided context only."
  );
}

export async function generateImportantQuestions(docId) {
  return runPrompt(
    docId,
    "Create 8-12 important exam questions. Output a numbered list.",
    "You are a study assistant. Use the provided context only."
  );
}

export async function answerQuestion(docId, question) {
  return runPrompt(
    docId,
    question,
    "Answer using only the context. If the answer is not in the context, say you do not know."
  );
}
