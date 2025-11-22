// AI Configuration
// Choose your LLM provider and model

// 🆓 FREE LLM PROVIDERS:
// 1. 'groq' - RECOMMENDED! Fast, free, generous limits (30 req/min)
// 2. 'gemini' - Google's model, free tier (15 req/min)
// 3. 'openai' - Paid, but most capable (requires billing)

export type LLMProvider = "groq" | "gemini" | "openai";

export interface AIConfig {
  provider: LLMProvider;
  models: {
    groq: string;
    gemini: string;
    openai: string;
  };
  temperature: number;
  maxTokens: number;
}

export const AI_CONFIG: AIConfig = {
  // Change provider here:
  provider: "groq", // ⬅️ Try 'groq' for FREE!

  // Models by provider:
  models: {
    groq: "llama-3.1-8b-instant", // Fast & reliable for function calling
    gemini: "gemini-1.5-flash", // Free Google model
    openai: "gpt-4o-mini", // Paid (rate limited)
  },

  temperature: 0.7,
  maxTokens: 1000,
};

// 🔑 API Keys (set in .env file):
// VITE_GROQ_API_KEY=your-groq-key        (Get free at: https://console.groq.com/)
// VITE_GEMINI_API_KEY=your-gemini-key    (Get free at: https://makersuite.google.com/)
// VITE_OPENAI_API_KEY=your-openai-key    (Paid service)
