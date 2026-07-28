// ============================================================
// PlanCraft AI — Zod Validation Schemas for API Routes
// ============================================================

import { z } from "zod";

export const questionsRequestSchema = z.object({
  rawIdea: z
    .string()
    .min(10, "Please describe your idea in at least 10 characters")
    .max(5000, "Idea description is too long"),
});

export const clarifyingQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
});

export const questionsResponseSchema = z.array(clarifyingQuestionSchema);


export const clarifyingQASchema = z.object({
  question: z.string(),
  answer: z.string().min(1, "Please answer all questions"),
});

export const structureRequestSchema = z.object({
  rawIdea: z.string().min(10),
  answers: z.array(clarifyingQASchema).min(1),
});

export const systemStructureSchema = z.object({
  scale: z.string(),
  overview: z.string(),
  coreFeatures: z.array(z.string()),
  techStack: z.object({
    frontend: z.string(),
    backend: z.string(),
    database: z.string(),
    deployment: z.string(),
    extras: z.array(z.string()),
  }),
  architecture: z.string(),
});

export const generatePrdRequestSchema = z.object({
  rawIdea: z.string().min(10),
  answers: z.array(clarifyingQASchema),
  structure: systemStructureSchema,
});

export const chatRefineRequestSchema = z.object({
  currentPrd: z.string().min(1, "PRD content is required"),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.any(),
    })
  ),
  instruction: z.string().min(1, "Please provide a refinement instruction"),
});

export const generateTasksRequestSchema = z.object({
  prdContent: z.string().min(1, "PRD content is required"),
  projectTitle: z.string().min(1, "Project title is required"),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    "setup",
    "database",
    "backend",
    "frontend",
    "testing",
    "deployment",
  ]),
  description: z.string(),
});

export const tasksResponseSchema = z.array(taskSchema);
