// ============================================================
// GET /api/project/[id]/spec — Expose secure markdown project spec via access token
// ============================================================

import { NextRequest } from "next/server";
import { getFirestoreDoc } from "@/lib/firebase/admin-rest";
import { compileProjectMarkdown } from "@/lib/utils/markdown-compiler";
import type { Project } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get token from query param (?token=...) or Authorization header (Bearer ...)
    const searchParams = req.nextUrl.searchParams;
    let token = searchParams.get("token");

    if (!token) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return new Response("Missing access token", { status: 401 });
    }

    // Fetch project from Firestore using secure REST API client
    const projectData = await getFirestoreDoc("projects", id) as Project | null;

    if (!projectData) {
      return new Response("Project not found", { status: 404 });
    }

    // Verify token matches project's accessToken
    if (projectData.accessToken !== token) {
      return new Response("Unauthorized access", { status: 403 });
    }

    // Compile specification to Markdown
    const markdown = compileProjectMarkdown(projectData);

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${projectData.title || "spec"}.md"`,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching project spec:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(errorMessage, { status: 500 });
  }
}
