# AI Context & Architecture Guide for ChatGPT

> **Notice:** This document is automatically generated and refreshed.
> **Last Synced:** `2026-09-09 14:08:59 UTC`
> **Git Branch:** `main` | **Latest Commit:** `64d86b6 - feat(groq): update models to active endpoints and improve fallback handling (11 minutes ago) by Balraj Gopi`

---

## 🤖 System Instructions for ChatGPT

```text
You are an expert Senior Full-Stack Architect & AI Systems Engineer.
You have complete context over the repository: Balrajgopi/ai-code-generator.
When the user asks questions or requests code:
1. Adhere strictly to the project's architecture, dependencies, and file layout detailed below.
2. Never suggest hardcoding credentials; all secrets must come from process.env via .env.
3. Recommend clean, production-ready ES Module (ESM) JavaScript/TypeScript code.
4. Keep solutions aligned with the dual-mode architecture (AI Orchestration vs CCG CLI).
```

---

## 1. Project Overview

- **Repository:** `Balrajgopi/ai-code-generator`
- **Version:** `1.7.86`
- **Module System:** ES Modules (`"type": "module"`)
- **Package Manager:** `pnpm` / `npm`
- **Core Technology:** Node.js (v20+), TypeScript, Groq SDK, Google Generative AI, Ollama (Local), Vitest, Go 1.21 (`codeagent-wrapper`).

---

## 2. Dual-Mode Architecture

### Mode A: Free AI Orchestrator (Direct AI Code Generation)
- **Entry Point:** `index.js`
- **Execution:** `node index.js "your task description"`
- **Orchestration Flow:**
  `index.js` ➔ `orchestrator.js` (Task Classifier & Router)
    ├── **Complex Tasks** (backend, api, db, bugs, server):
    │     Tries **Ollama** (local deep reasoning) ➔ Falls back to **Groq**
    └── **General / Fast Tasks** (frontend, scripts, queries, explanation):
          Tries **Groq** (ultra-fast cloud generation) ➔ Falls back to **Ollama**
- **Active Cloud Models (Groq):** `openai/gpt-oss-20b, qwen/qwen3.6-27b, openai/gpt-oss-120b, llama-3.3-70b-versatile, llama-3.1-8b-instant`
- **Local Models (Ollama):** `deepseek-coder`, `codellama`, `llama3` (endpoint: `http://localhost:11434`)

### Mode B: CCG Workflow Collaboration System
- **Entry Point:** `bin/ccg.mjs` / `dist/cli.mjs` (Source: `src/cli.ts`)
- **Execution:** `npm start` or `node bin/ccg.mjs`
- **Purpose:** Multi-model routing development workflow combining Claude Code, Codex, and Gemini with automated MCP tool configurations.

---

## 3. Repository File Structure

```text
ccg-workflow/
├── .env                  # LOCAL ONLY (Gitignored) - Contains GROQ_API_KEY, OLLAMA_URL
├── .env.example          # Template with dummy placeholders (NEVER put real keys here)
├── index.js              # Entry point for AI code generation CLI
├── orchestrator.js       # Smart routing logic (Groq vs Ollama)
├── groq.js               # Groq SDK client with automatic model fallback
├── ollama.js             # Ollama local HTTP API client with streaming & timeouts
├── gemini.js             # Google Generative AI integration
├── config.js             # Shared environment and configuration validation
├── classifier.js         # Text pattern classification
├── bin/
│   └── ccg.mjs           # Executable wrapper for the CCG multi-model CLI
├── src/                  # TypeScript source for CCG CLI workflows & MCP installers
│   ├── cli.ts            # CAC-based CLI commands (init, config, diagnose-mcp, etc.)
│   ├── utils/            # MCP managers, platform adapters, installer helpers
│   └── types/            # TypeScript interfaces (McpServerConfig, etc.)
├── codeagent-wrapper/    # High-performance Go binary for sub-agent execution
│   └── main.go
├── templates/            # Prompt templates & workflow rule specifications
├── scripts/
│   └── refresh-chatgpt-context.mjs  # Automation script to refresh this file
└── CHATGPT_README.md     # THIS FILE (ChatGPT context documentation)
```

---

## 4. Current Repository State

- **Branch:** `main`
- **Recent Git History:**
```text
64d86b6 feat(groq): update models to active endpoints and improve fallback handling
fc710b5 fix(ci): skip slow signal forwarding test in short mode for CI reliability
3b583dc fix(ci): sync pnpm-lock.yaml, fix mcp type error, and configure contributors action
9919783 chore: strengthen .gitignore to prevent secret leaks
35cd0e5 FIRST Commit
```
- **Working Tree Status:**
```text
?? scripts/
```

---

## 5. Security & Credential Rules

1. **Strictly Gitignored:**
   - `.env`, `.env.*`, `*.local`, `*.pem`, `*.key`, `credentials.json`
2. **Active Git Guards:**
   - Pre-commit hook in `.git/hooks/pre-commit` aborts commits containing patterns like `gsk_`, `AIza`, `sk-`, `ghp_`.
3. **Template Safety:**
   - `.env.example` only contains safe placeholders: `GROQ_API_KEY=your-GROQ_API_KEY`.

---

## 6. Common Developer Questions & Tasks to Ask ChatGPT

You can copy and paste any of these prompt templates into ChatGPT:

### Prompt 1: Adding a New Model or Provider
> *"I want to add a new model provider (e.g. OpenRouter or Cerebras) to `orchestrator.js` and `groq.js`. Here is my `CHATGPT_README.md`. Please provide the updated code with fallback support."*

### Prompt 2: Enhancing the Smart Routing Logic
> *"In `orchestrator.js`, how can I improve `isComplexTask` using semantic keyword matching or a scoring system instead of simple substring matching?"*

### Prompt 3: Debugging an Execution Error
> *"When running `node index.js "task" `, I encountered the following error: [paste error]. Review `groq.js` and `orchestrator.js` and provide the fix."*

### Prompt 4: Building a Web Dashboard
> *"I want to build a simple web interface (Express/Fastify + Vanilla HTML/JS) to submit tasks to `orchestrate()` from `orchestrator.js`. Please design a minimal, clean implementation."*
