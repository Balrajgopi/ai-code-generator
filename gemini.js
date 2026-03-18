// ============================================================
// gemini.js — Google Gemini API client (free tier)
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Build a structured, high-quality prompt for Gemini.
 * Gemini-flash performs best with clear role + context + task format.
 */
function buildPrompt(userTask) {
  return `You are an expert frontend developer and UI/UX engineer.

TASK: ${userTask}

INSTRUCTIONS:
- Provide clean, production-ready code
- Include brief inline comments for clarity
- If generating HTML/CSS/JS, make it self-contained and modern
- If explaining a concept, be concise and use examples
- Respond directly — no filler phrases like "Certainly!" or "Of course!"

OUTPUT:`;
}

/**
 * Ask Gemini a frontend/design-related question.
 * @param {string} task - User's task description
 * @returns {Promise<string>} - Model's response text
 */
async function askGemini(task) {
  try {
    const model = genAI.getGenerativeModel({
      model: config.gemini.model,
      generationConfig: {
        maxOutputTokens: config.gemini.maxOutputTokens,
        temperature: 0.4, // Balanced: creative but structured
      },
    });

    const prompt = buildPrompt(task);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return "⚠️ Gemini returned an empty response. Try rephrasing your task.";
    }

    return text;
  } catch (error) {
    // Provide helpful error messages instead of generic ones
    if (error.message?.includes("API_KEY_INVALID")) {
      return "❌ Gemini Error: Invalid API key. Check your .env file.";
    }
    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return "❌ Gemini Error: Free tier quota exceeded. Wait until quota resets (usually daily).";
    }
    if (error.message?.includes("SAFETY")) {
      return "❌ Gemini Error: Request blocked by safety filters. Rephrase your task.";
    }
    console.error("❌ Gemini Error:", error.message);
    return `❌ Gemini Error: ${error.message}`;
  }
}

export default askGemini;