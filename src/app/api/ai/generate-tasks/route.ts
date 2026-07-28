// ============================================================
// POST /api/ai/generate-tasks — Generate task breakdown from PRD
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { generateTasksRequestSchema } from "@/lib/ai/schemas";
import { TASKS_PROMPT } from "@/lib/ai/prompts";
import { qualityModel } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = generateTasksRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prdContent, projectTitle } = parsed.data;

    const { text } = await generateText({
      model: qualityModel,
      prompt: TASKS_PROMPT(prdContent, projectTitle),
      temperature: 0.7,
    });

    // Parse JSON from response
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const tasks = JSON.parse(cleanedText);

    // Add completed: false to each task
    const tasksWithStatus = tasks.map((task: Record<string, unknown>) => ({
      ...task,
      completed: false,
    }));

    return NextResponse.json({ tasks: tasksWithStatus });
  } catch (error) {
    console.error("Tasks generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate tasks. Please try again." },
      { status: 500 }
    );
  }
}
