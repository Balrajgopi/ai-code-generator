// ============================================================
// classifier.js — Smart task routing (NLP-style scoring)
// ============================================================
// Instead of simple keyword matching, we score every task
// against weighted keyword categories and pick the winner.
// This is transparent, debuggable, and fully offline.
// ============================================================

// FRONTEND signals → routes to Gemini (better at creative/UI tasks)
const FRONTEND_SIGNALS = {
  // Frameworks & libraries
  react: 4, vue: 4, angular: 4, svelte: 4, nextjs: 4, nuxt: 4,
  // Languages & markup
  html: 3, css: 3, scss: 3, sass: 3, tailwind: 3, bootstrap: 3,
  // UI concepts
  ui: 3, ux: 3, component: 3, layout: 3, design: 3, style: 3,
  page: 2, button: 2, form: 2, modal: 2, navbar: 2, sidebar: 2,
  animation: 2, transition: 2, responsive: 2, mobile: 2,
  // Output types
  interface: 2, "landing page": 3, dashboard: 2, template: 2, wireframe: 2,
  // JS frontend
  dom: 2, event: 2, fetch: 1, "user interface": 4,
};

// BACKEND signals → routes to Ollama (CodeLlama excels at logic/code)
const BACKEND_SIGNALS = {
  // Languages
  python: 3, node: 3, nodejs: 3, java: 3, golang: 3, rust: 3, "c++": 3,
  // Backend concepts
  api: 3, rest: 3, graphql: 3, endpoint: 3, server: 3, backend: 4,
  database: 3, sql: 3, mongodb: 3, mysql: 3, postgres: 3, redis: 3,
  // Code tasks
  algorithm: 3, function: 2, class: 2, refactor: 3, optimize: 2,
  debug: 3, bug: 3, error: 2, fix: 2, test: 2, unit: 2,
  // DevOps & infra
  docker: 3, kubernetes: 3, deploy: 2, ci: 2, pipeline: 2,
  // Data
  json: 2, xml: 2, parse: 2, scrape: 2, script: 2,
  // Misc code
  logic: 2, loop: 2, recursion: 3, sorting: 3, "data structure": 3,
};

/**
 * Classify a task string and return routing decision.
 * @param {string} task - The raw task string from the user
 * @returns {{ route: "gemini"|"ollama", confidence: number, reason: string }}
 */
export function classify(task) {
  const lower = task.toLowerCase();
  const words = lower.split(/\s+/);

  let frontendScore = 0;
  let backendScore = 0;

  // Score multi-word phrases first (higher priority)
  for (const phrase of Object.keys(FRONTEND_SIGNALS)) {
    if (lower.includes(phrase)) frontendScore += FRONTEND_SIGNALS[phrase];
  }
  for (const phrase of Object.keys(BACKEND_SIGNALS)) {
    if (lower.includes(phrase)) backendScore += BACKEND_SIGNALS[phrase];
  }

  const total = frontendScore + backendScore;
  const confidence = total === 0 ? 0 : Math.round((Math.max(frontendScore, backendScore) / total) * 100);

  if (frontendScore === 0 && backendScore === 0) {
    // Ambiguous: default to Ollama (better at generic code tasks)
    return { route: "ollama", confidence: 50, reason: "No strong signals — defaulting to Ollama (code tasks)" };
  }

  if (frontendScore > backendScore) {
    return {
      route: "gemini",
      confidence,
      reason: `Frontend score ${frontendScore} vs backend ${backendScore} → Gemini`,
    };
  }

  return {
    route: "ollama",
    confidence,
    reason: `Backend score ${backendScore} vs frontend ${frontendScore} → Ollama`,
  };
}
