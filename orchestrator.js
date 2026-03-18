import askGroq from "./groq.js";
import askOllama from "./ollama.js";

function isComplexTask(task) {
  const keywords = [
    "api", "database", "authentication",
    "backend", "logic", "server", "bug", "fix"
  ];

  return keywords.some(k => task.toLowerCase().includes(k));
}

async function orchestrate(task) {
  console.log("\n🧠 Smart Routing System\n");

  if (isComplexTask(task)) {
    console.log("🧠 Using Ollama (deep reasoning)");

    try {
      return await askOllama(task);
    } catch (err) {
      console.log("⚠️ Ollama failed → fallback to Groq");
      return await askGroq(task);
    }

  } else {
    console.log("⚡ Using Groq (fast generation)");

    try {
      return await askGroq(task);
    } catch (err) {
      console.log("⚠️ Groq failed → fallback to Ollama");
      return await askOllama(task);
    }
  }
}

export default orchestrate;