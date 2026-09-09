#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function runCmd(cmd) {
  try {
    return execSync(cmd, { cwd: rootDir, encoding: 'utf-8' }).trim();
  } catch (e) {
    return '';
  }
}

// 1. Gather Git & Project Metadata
const branch = runCmd('git branch --show-current') || 'main';
const latestCommit = runCmd('git log -1 --format="%h - %s (%cr) by %an"') || 'Unknown';
const recentCommits = runCmd('git log -5 --oneline') || 'None';
const gitStatus = runCmd('git status --short') || 'Working tree clean';
const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

// 2. Read active models from groq.js if available
let groqModels = 'openai/gpt-oss-20b, qwen/qwen3.6-27b, openai/gpt-oss-120b';
try {
  const groqContent = fs.readFileSync(path.join(rootDir, 'groq.js'), 'utf-8');
  const match = groqContent.match(/const MODELS = \[([\s\S]*?)\];/);
  if (match) {
    groqModels = match[1]
      .split('\n')
      .map(l => l.trim().replace(/[",]/g, ''))
      .filter(Boolean)
      .join(', ');
  }
} catch (e) {}

const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

// 3. Construct the comprehensive ChatGPT context document
const content = `# AI Context & Architecture Guide for ChatGPT

> **Notice:** This document is automatically generated and refreshed.
> **Last Synced:** \`${timestamp}\`
> **Git Branch:** \`${branch}\` | **Latest Commit:** \`${latestCommit}\`

---

## 🤖 System Instructions for ChatGPT

\`\`\`text
You are an expert Senior Full-Stack Architect & AI Systems Engineer.
You have complete context over the repository: Balrajgopi/ai-code-generator.
When the user asks questions or requests code:
1. Adhere strictly to the project's architecture, dependencies, and file layout detailed below.
2. Never suggest hardcoding credentials; all secrets must come from process.env via .env.
3. Recommend clean, production-ready ES Module (ESM) JavaScript/TypeScript code.
4. Keep solutions aligned with the dual-mode architecture (AI Orchestration vs CCG CLI).
\`\`\`

---

## 1. Project Overview

- **Repository:** \`Balrajgopi/ai-code-generator\`
- **Version:** \`${pkgJson.version}\`
- **Module System:** ES Modules (\`"type": "module"\`)
- **Package Manager:** \`pnpm\` / \`npm\`
- **Core Technology:** Node.js (v20+), TypeScript, Groq SDK, Google Generative AI, Ollama (Local), Vitest, Go 1.21 (\`codeagent-wrapper\`).

---

## 2. Dual-Mode Architecture

### Mode A: Free AI Orchestrator (Direct AI Code Generation)
- **Entry Point:** \`index.js\`
- **Execution:** \`node index.js "your task description"\`
- **Orchestration Flow:**
  \`index.js\` ➔ \`orchestrator.js\` (Task Classifier & Router)
    ├── **Complex Tasks** (backend, api, db, bugs, server):
    │     Tries **Ollama** (local deep reasoning) ➔ Falls back to **Groq**
    └── **General / Fast Tasks** (frontend, scripts, queries, explanation):
          Tries **Groq** (ultra-fast cloud generation) ➔ Falls back to **Ollama**
- **Active Cloud Models (Groq):** \`${groqModels}\`
- **Local Models (Ollama):** \`deepseek-coder\`, \`codellama\`, \`llama3\` (endpoint: \`http://localhost:11434\`)

### Mode B: CCG Workflow Collaboration System
- **Entry Point:** \`bin/ccg.mjs\` / \`dist/cli.mjs\` (Source: \`src/cli.ts\`)
- **Execution:** \`npm start\` or \`node bin/ccg.mjs\`
- **Purpose:** Multi-model routing development workflow combining Claude Code, Codex, and Gemini with automated MCP tool configurations.

---

## 3. Repository File Structure

\`\`\`text
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
\`\`\`

---

## 4. Current Repository State

- **Branch:** \`${branch}\`
- **Recent Git History:**
\`\`\`text
${recentCommits}
\`\`\`
- **Working Tree Status:**
\`\`\`text
${gitStatus}
\`\`\`

---

## 5. Security & Credential Rules

1. **Strictly Gitignored:**
   - \`.env\`, \`.env.*\`, \`*.local\`, \`*.pem\`, \`*.key\`, \`credentials.json\`
2. **Active Git Guards:**
   - Pre-commit hook in \`.git/hooks/pre-commit\` aborts commits containing patterns like \`gsk_\`, \`AIza\`, \`sk-\`, \`ghp_\`.
3. **Template Safety:**
   - \`.env.example\` only contains safe placeholders: \`GROQ_API_KEY=your-GROQ_API_KEY\`.

---

## 6. Common Developer Questions & Tasks to Ask ChatGPT

You can copy and paste any of these prompt templates into ChatGPT:

### Prompt 1: Adding a New Model or Provider
> *"I want to add a new model provider (e.g. OpenRouter or Cerebras) to \`orchestrator.js\` and \`groq.js\`. Here is my \`CHATGPT_README.md\`. Please provide the updated code with fallback support."*

### Prompt 2: Enhancing the Smart Routing Logic
> *"In \`orchestrator.js\`, how can I improve \`isComplexTask\` using semantic keyword matching or a scoring system instead of simple substring matching?"*

### Prompt 3: Debugging an Execution Error
> *"When running \`node index.js \"task\" \`, I encountered the following error: [paste error]. Review \`groq.js\` and \`orchestrator.js\` and provide the fix."*

### Prompt 4: Building a Web Dashboard
> *"I want to build a simple web interface (Express/Fastify + Vanilla HTML/JS) to submit tasks to \`orchestrate()\` from \`orchestrator.js\`. Please design a minimal, clean implementation."*
`;

// 4. Write to CHATGPT_README.md
const targetFile = path.join(rootDir, 'CHATGPT_README.md');
fs.writeFileSync(targetFile, content, 'utf-8');
console.log(`✅ Successfully updated: ${targetFile}`);

// 5. If on Windows, copy directly to clipboard
if (process.platform === 'win32') {
  try {
    execSync('clip', { input: content });
    console.log('📋 Document copied to clipboard! You can now press Ctrl+V directly in ChatGPT.');
  } catch (e) {
    // Clipboard copy is optional
  }
}
