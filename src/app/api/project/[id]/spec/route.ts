// ============================================================
// GET /api/project/[id]/spec — Expose secure markdown project spec via access token
// ============================================================

import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
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

    // Fetch project from Firestore using Firebase Admin SDK
    const docRef = adminDb.collection("projects").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new Response("Project not found", { status: 404 });
    }

    const projectData = docSnap.data() as Project;

    // Verify token matches project's accessToken
    if (projectData.accessToken !== token) {
      return new Response("Unauthorized access", { status: 403 });
    }

    // Compile specification to Markdown
    const markdownSpec = compileProjectMarkdown(projectData);

    // Return as plain text Markdown file
    return new Response(markdownSpec, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${projectData.title || "spec"}.md"`,
      },
    });
  } catch (error) {
    console.error("Failed to fetch project spec:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
