// ============================================================
// ollama.js — Local Ollama API client (CodeLlama)
// ============================================================

import axios from "axios";
import { config } from "./config.js";

const { baseUrl, model, timeoutMs, retries } = config.ollama;

/**
 * Build a structured prompt optimized for CodeLlama instruction format.
 * CodeLlama-instruct uses [INST] tags for best performance.
 */
function buildPrompt(userTask) {
  return `[INST] You are an expert backend developer and software engineer.

TASK: ${userTask}

RULES:
- Write clean, well-commented code
- Use best practices for the relevant language/framework
- If explaining, be concise and technical
- Do NOT add unnecessary preamble — get straight to the answer

[/INST]`;
}

/**
 * Check if Ollama server is reachable before sending a request.
 * @returns {Promise<boolean>}
 */
async function isOllamaRunning() {
  try {
    await axios.get(`${baseUrl}/api/tags`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ask Ollama (CodeLlama) a backend/code-related question.
 * Includes retry logic for reliability.
 * @param {string} task - User's task description
 * @returns {Promise<string>} - Model's response text
 */
async function askOllama(task) {
  // Health check first — fail fast with a clear message
  const running = await isOllamaRunning();
  if (!running) {
    return (
      `❌ Ollama is not running at ${baseUrl}.\n` +
      `💡 Fix: Open a terminal and run: ollama serve\n` +
      `   Then make sure the model is downloaded: ollama pull ${model}`
    );
  }

  const prompt = buildPrompt(task);

  // Send a tiny warmup request first.
  // On cold start, this triggers CodeLlama to load into RAM while we wait,
  // so the real inference request hits an already-warm model.
  try {
    await axios.post(
      `${baseUrl}/api/generate`,
      { model, prompt: "hi", stream: false, options: { num_predict: 1 } },
      { timeout: 90000 } // allow up to 90s just for model load
    );
  } catch {
    // Warmup failing is non-fatal — the real request may still succeed
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${baseUrl}/api/generate`,
        {
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.2, // Lower = more precise/deterministic for code
            num_predict: 1024, // Max tokens to generate
          },
        },
        { timeout: timeoutMs }
      );

      const text = response.data?.response;
      if (!text || text.trim().length === 0) {
        return "⚠️ Ollama returned an empty response. Try rephrasing your task.";
      }

      return text;
    } catch (error) {
      const isLastAttempt = attempt === retries;

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          return `❌ Ollama connection refused. Is it running? Try: ollama serve`;
        }
        if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
          if (!isLastAttempt) {
            console.warn(`⏳ Ollama is still processing (attempt ${attempt}/${retries}). Model may be loading into RAM — please wait...`);
            continue;
          }
          return `❌ Ollama timed out after ${timeoutMs / 1000}s. The model may be loading. Try again in a moment.`;
        }
        if (error.response?.status === 404) {
          return `❌ Model "${model}" not found in Ollama. Run: ollama pull ${model}`;
        }
      }

      if (isLastAttempt) {
        console.error("❌ Ollama Error:", error.message);
        return `❌ Ollama Error: ${error.message}`;
      }
    }
  }
}

export default askOllama;