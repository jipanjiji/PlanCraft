// ============================================================
// POST /api/ai/questions — Generate clarifying questions from raw idea
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { questionsRequestSchema } from "@/lib/ai/schemas";
import { QUESTIONS_PROMPT } from "@/lib/ai/prompts";
import { fastModel } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = questionsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { rawIdea } = parsed.data;

    const { text } = await generateText({
      model: fastModel,
      prompt: QUESTIONS_PROMPT(rawIdea),
      temperature: 0.7,
    });

    // Parse the JSON array from the response
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions = JSON.parse(cleanedText);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Questions generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
