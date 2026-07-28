// ============================================================
// PlanCraft AI — Groq (via OpenAI compatibility layer) client
// ============================================================

import { createOpenAI } from "@ai-sdk/openai";

export const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// We use llama-3.1-70b-versatile for complex reasoning tasks (PRD, chat refinement, structure)
// We use llama-3.1-8b-instant for fast, simpler tasks (questions)
export const fastModel = groq("llama-3.1-8b-instant");
export const qualityModel = groq("llama-3.3-70b-versatile");
