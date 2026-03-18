// ============================================================
// index.js — Entry point for the free AI orchestration system
// Usage:  node index.js "your task here"
// ============================================================
import 'dotenv/config';
import orchestrate from "./orchestrator.js";

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║         FREE AI ORCHESTRATION SYSTEM                 ║
║         Gemini (Frontend) + Ollama/CodeLlama (Backend) ║
╚══════════════════════════════════════════════════════╝

USAGE:
  node index.js "your task description"

EXAMPLES:
  node index.js "Create a responsive navbar in HTML and CSS"
  node index.js "Write a Python function to sort a list of dicts"
  node index.js "Explain how REST APIs work"
  node index.js "Build a login form with validation"
  node index.js "Debug this SQL query: SELECT * FROM users WHERE"

ROUTING LOGIC:
  🎨 Gemini  → UI, HTML, CSS, React, design, layout tasks
  ⚙️  Ollama  → Python, APIs, algorithms, backend, databases
  `);
}

async function run() {
  // Support multi-word tasks (join all CLI args into one string)
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    return;
  }

  const task = args.join(" ");

  console.log(`\n📋 Task: "${task}"`);
  console.log("━".repeat(50));

  const startTime = Date.now();

  const result = await orchestrate(task);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("━".repeat(50));
  console.log(`✅ RESULT (completed in ${elapsed}s):\n`);
  console.log(result);
  console.log("\n" + "━".repeat(50));
}

run().catch((err) => {
  console.error("💥 Unexpected fatal error:", err.message);
  process.exit(1);
});