// ============================================================
// PlanCraft AI — Step 6: Export (Indonesian)
// ============================================================

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  FileText,
  Sparkles,
  ExternalLink,
  Terminal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  compileProjectMarkdown,
  downloadMarkdown,
  copyToClipboard,
} from "@/lib/utils/markdown-compiler";
import { slugify } from "@/lib/utils/helpers";
import type { Project } from "@/lib/types";

interface ExportStepProps {
  project: Project;
  onBack: () => void;
  onGoToDashboard: () => void;
}

export function ExportStep({ project, onBack, onGoToDashboard }: ExportStepProps) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const markdownContent = compileProjectMarkdown(project);
  const filename = `${slugify(project.title || "project-spec")}.md`;

  const handleDownload = () => {
    downloadMarkdown(markdownContent, filename);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopyMarkdown = async () => {
    await copyToClipboard(markdownContent);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 3000);
  };

  const handleCopyPrompt = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const promptString = `Bantu saya membangun aplikasi ini. Unduh spesifikasi lengkap proyek (PRD & Daftar Tugas) dengan menjalankan perintah curl berikut di terminal Anda:

\`\`\`bash
curl -s "${origin}/api/project/${project.id}/spec?token=${project.accessToken || ""}" -o project-spec.md
\`\`\`

Setelah file project-spec.md terunduh, baca seluruh isinya dan ikuti semua persyaratan serta daftar tugas pengembangan yang didefinisikan di dalamnya.`;

    await copyToClipboard(promptString);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Sparkles className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Spesifikasi Proyek Anda Sudah Siap! 🎉
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Unduh file spesifikasi Markdown terpadu atau langsung salin Prompt AI untuk asisten coding Anda (Cursor, Claude, dll).
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {/* Download Button */}
        <Button
          onClick={handleDownload}
          size="lg"
          className={`gap-2 transition-all duration-300 ${
            downloaded
              ? "bg-emerald-600 hover:bg-emerald-600"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {downloaded ? (
            <>
              <Check className="h-4 w-4" />
              Terunduh!
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Unduh {filename}
            </>
          )}
        </Button>

        {/* Copy Prompt AI Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleCopyPrompt}
          className={`gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/5 transition-all duration-300 ${
            copiedPrompt ? "text-emerald-400 border-emerald-500/30" : ""
          }`}
        >
          {copiedPrompt ? (
            <>
              <Check className="h-4 w-4" />
              Prompt AI Tersalin!
            </>
          ) : (
            <>
              <Terminal className="h-4 w-4" />
              Salin Prompt AI (cURL)
            </>
          )}
        </Button>

        {/* Copy Markdown Content Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleCopyMarkdown}
          className={`gap-2 border-border transition-all duration-300 ${
            copiedMarkdown ? "text-emerald-400 border-emerald-500/30" : ""
          }`}
        >
          {copiedMarkdown ? (
            <>
              <Check className="h-4 w-4" />
              Markdown Tersalin!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Salin Markdown
            </>
          )}
        </Button>
      </div>

      {/* File Info */}
      <Card className="border-border bg-card mx-auto max-w-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{filename}</p>
            <p className="text-xs text-muted-foreground">
              {(new Blob([markdownContent]).size / 1024).toFixed(1)} KB •{" "}
              {markdownContent.split("\n").length} baris
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Pratinjau File
        </h3>
        <ScrollArea className="h-[400px] rounded-lg border border-border bg-[#0A0A0A] p-6">
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-pre:bg-card prose-pre:border prose-pre:border-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Tugas
        </Button>
        <Button
          onClick={onGoToDashboard}
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted"
        >
          Ke Dasbor
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
