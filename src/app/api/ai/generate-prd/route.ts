// ============================================================
// POST /api/ai/generate-prd — Stream generated PRD markdown
// ============================================================

import { NextRequest } from "next/server";
import { streamText } from "ai";
import { generatePrdRequestSchema } from "@/lib/ai/schemas";
import { PRD_PROMPT } from "@/lib/ai/prompts";
import { qualityModel } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = generatePrdRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { rawIdea, answers, structure } = parsed.data;

    const result = streamText({
      model: qualityModel,
      prompt: PRD_PROMPT(rawIdea, answers, structure),
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("PRD generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PRD. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
