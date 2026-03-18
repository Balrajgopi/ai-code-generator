// ============================================================
// config.js — Centralized configuration for the free AI system
// ============================================================

import "dotenv/config";

export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: "gemini-2.0-flash", // ✅ Current working free-tier model (replaces deprecated gemini-1.5-flash-latest)
    maxOutputTokens: 2048,
  },
  ollama: {
    baseUrl: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "codellama", // Change to "mistral" if you prefer
    timeoutMs: 180000, // 180 seconds — CodeLlama needs up to 3 min on cold start (first run after restart)
    retries: 2,
  },
};

// Validate required config on startup
export function validateConfig() {
  if (!config.gemini.apiKey) {
    throw new Error(
      "❌ GEMINI_API_KEY is not set. Create a .env file with GEMINI_API_KEY=your_key_here"
    );
  }
}
