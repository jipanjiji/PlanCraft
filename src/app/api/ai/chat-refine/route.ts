// ============================================================
// POST /api/ai/chat-refine — Refine PRD via chat conversation
// ============================================================

import { NextRequest } from "next/server";
import { streamText } from "ai";
import { chatRefineRequestSchema } from "@/lib/ai/schemas";
import { CHAT_REFINE_PROMPT } from "@/lib/ai/prompts";
import { qualityModel } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatRefineRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { currentPrd, instruction } = parsed.data;

    const result = streamText({
      model: qualityModel,
      prompt: CHAT_REFINE_PROMPT(currentPrd, instruction),
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat refinement error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to refine PRD. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
