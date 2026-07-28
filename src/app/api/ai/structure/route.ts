// ============================================================
// POST /api/ai/structure — Generate system structure from idea + answers
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { structureRequestSchema } from "@/lib/ai/schemas";
import { STRUCTURE_PROMPT } from "@/lib/ai/prompts";
import { qualityModel } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = structureRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { rawIdea, answers } = parsed.data;

    const { text } = await generateText({
      model: qualityModel,
      prompt: STRUCTURE_PROMPT(rawIdea, answers),
      temperature: 0.7,
    });

    // Parse JSON from response
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const structure = JSON.parse(cleanedText);

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Structure generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate structure. Please try again." },
      { status: 500 }
    );
  }
}
