// ============================================================
// PlanCraft AI — Completed Project View Page
// Dedicated screen for final specs, version comparisons & commits
// ============================================================

"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAiStream } from "@/hooks/useAiStream";
import { getProject, updateProject } from "@/lib/firebase/firestore";
import { generateId, slugify, formatRelativeTime } from "@/lib/utils/helpers";
import { TocSidebar, mdHeadingComponents } from "@/components/wizard/TocSidebar";
import { computeLineDiff } from "@/lib/utils/diff";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  compileProjectMarkdown,
  downloadMarkdown,
  copyToClipboard,
} from "@/lib/utils/markdown-compiler";

import {
  Sparkles,
  ArrowLeft,
  History,
  Copy,
  Check,
  Download,
  Terminal,
  Bot,
  User,
  Send,
  Edit3,
} from "lucide-react";
import type {
  ChatMessage,
  Project,
  PrdVersion,
} from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

function CompletedProjectViewContent() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { stream } = useAiStream();

  const [loading, setLoading] = useState(true);
  const [completedViewMode, setCompletedViewMode] = useState<"view" | "edit" | "diff">("view");
  const [tempPrdContent, setTempPrdContent] = useState("");
  const [diffVersionId, setDiffVersionId] = useState("");
  const [viewingVersionId, setViewingVersionId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copiedPrd, setCopiedPrd] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Project data
  const [title, setTitle] = useState("");
  const [rawIdea, setRawIdea] = useState("");
  const [answers, setAnswers] = useState<Project["clarifyingQuestions"]>([]);
  const [structure, setStructure] = useState<Project["systemStructure"]>(null);
  const [prdContent, setPrdContent] = useState("");
  const [prdVersions, setPrdVersions] = useState<PrdVersion[]>([]);
  const [tasks, setTasks] = useState<Project["tasks"]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Dialog management
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [pendingRestoreContent, setPendingRestoreContent] = useState("");
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const completedEditRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getCompiledMarkdownForPrd = (content: string) => {
    return compileProjectMarkdown({
      id: projectId,
      userId: user?.uid || "",
      title: title || "Untitled Project",
      rawIdea,
      status: "completed",
      clarifyingQuestions: answers,
      systemStructure: structure,
      prdContent: content,
      tasks,
      accessToken,
      prdVersions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const activePreviewText = viewingVersionId
    ? getCompiledMarkdownForPrd(prdVersions.find((v) => v.id === viewingVersionId)?.prdContent || "")
    : getCompiledMarkdownForPrd(prdContent);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Load completed project
  useEffect(() => {
    if (!user || !projectId) return;

    const loadProject = async () => {
      try {
        const project = await getProject(projectId);
        if (!project || project.userId !== user.uid) {
          router.replace("/dashboard");
          return;
        }

        // If project is not completed, redirect to wizard resume page
        if (project.status !== "completed") {
          router.replace(`/project/${projectId}`);
          return;
        }

        setTitle(project.title);
        setRawIdea(project.rawIdea);
        setAnswers(project.clarifyingQuestions);
        setStructure(project.systemStructure);
        setPrdContent(project.prdContent);
        setPrdVersions(project.prdVersions || []);
        setTasks(project.tasks);
        setAccessToken(project.accessToken || "");
      } catch (error) {
        console.error("Failed to load completed project:", error);
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [user, projectId, router]);

  // Helper to save updates
  const saveProjectUpdates = async (updates: Partial<Project>) => {
    try {
      await updateProject(projectId, updates);
    } catch (error) {
      console.error("Failed to save project updates:", error);
    }
  };

  // Edit Handlers
  const handleEnterEditMode = () => {
    setTempPrdContent(prdContent);
    setCompletedViewMode("edit");
  };

  const handleSaveCompletedEdits = async () => {
    if (tempPrdContent === prdContent) {
      setCompletedViewMode("view");
      return;
    }

    const newVer: PrdVersion = {
      id: generateId(),
      prdContent: tempPrdContent,
      createdAt: new Date(),
      createdBy: "user",
      label: `Versi ${prdVersions.length + 1}: Edit Manual (User)`,
    };
    const updatedVersions = [...prdVersions, newVer];
    setPrdVersions(updatedVersions);
    setPrdContent(tempPrdContent);
    setCompletedViewMode("view");
    setViewingVersionId("");
    
    await saveProjectUpdates({
      prdContent: tempPrdContent,
      prdVersions: updatedVersions,
    });
  };

  const handleCancelCompletedEdits = () => {
    // Only warn if there are changes
    if (tempPrdContent !== prdContent) {
      setIsCancelOpen(true);
    } else {
      setCompletedViewMode("view");
    }
  };

  const handleConfirmCancelEdits = () => {
    setCompletedViewMode("view");
  };

  const handleCompletedChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const instruction = chatInput.trim();
    setChatInput("");

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: instruction,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const fullContent = await stream("/api/ai/chat-refine", {
        currentPrd: tempPrdContent,
        messages: [...chatMessages, userMessage],
        instruction,
      });

      if (fullContent) {
        setTempPrdContent(fullContent);
        setChatMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content: "Saya telah memperbarui draf PRD. Klik 'Simpan Perubahan' untuk menyimpan versi ini ke server.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat memperbarui PRD. Silakan coba lagi.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Restore Handler
  const handleTriggerRestore = (content: string) => {
    setPendingRestoreContent(content);
    setIsRestoreOpen(true);
  };

  const handleConfirmRestore = async () => {
    setPrdContent(pendingRestoreContent);
    setViewingVersionId(""); // exit preview of history
    await saveProjectUpdates({
      prdContent: pendingRestoreContent,
    });
  };

  // Export Compilation Object
  const currentProject: Project = {
    id: projectId,
    userId: user?.uid || "",
    title: title || "Untitled Project",
    rawIdea,
    status: "completed",
    clarifyingQuestions: answers,
    systemStructure: structure,
    prdContent,
    tasks,
    accessToken,
    prdVersions,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const proseClasses = "prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-h1:text-2xl prose-h1:font-bold prose-h1:pb-2 prose-h1:border-b prose-h1:border-border prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:text-zinc-200 prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:my-3 prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-ul:list-disc prose-ul:pl-5 prose-li:my-1";

  const handleDownloadPrd = () => {
    const md = compileProjectMarkdown(currentProject);
    downloadMarkdown(md, `${slugify(currentProject.title || "project-spec")}.md`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopyPrd = async () => {
    const md = compileProjectMarkdown(currentProject);
    await copyToClipboard(md);
    setCopiedPrd(true);
    setTimeout(() => setCopiedPrd(false), 3000);
  };

  const handleCopyPrompt = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const promptString = "Bantu saya membangun aplikasi ini. Silakan baca spesifikasi lengkap proyek (PRD & Daftar Tugas) dengan mengakses data dari perintah curl berikut:\n\n```bash\ncurl -s \"" + origin + "/api/project/" + projectId + "/spec?token=" + (accessToken || "") + "\"\n```\n\nBaca seluruh spesifikasi produk tersebut dan ikuti semua persyaratan serta daftar tugas pengembangan yang didefinisikan di dalamnya.";
    await copyToClipboard(promptString);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleToggleDiff = (vId: string) => {
    setDiffVersionId(vId);
    setCompletedViewMode("diff");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 animate-pulse-glow">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Memuat proyek...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{title || "Untitled Project"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Selesai
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
            Spesifikasi produk siap dikembangkan. Unduh berkas Markdown atau gunakan asisten AI untuk memodifikasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {completedViewMode === "view" && (
            <>
              <Button
                onClick={handleEnterEditMode}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg active:scale-[0.98]"
              >
                <Edit3 className="h-4 w-4" />
                Edit PRD
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground rounded-lg"
              >
                Ke Dasbor
              </Button>
            </>
          )}
          {completedViewMode === "edit" && (
            <>
              <Button
                onClick={handleCancelCompletedEdits}
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground rounded-lg"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveCompletedEdits}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg active:scale-[0.98]"
              >
                <Check className="h-4 w-4" />
                Simpan Perubahan
              </Button>
            </>
          )}
          {completedViewMode === "diff" && (
            <Button
              onClick={() => setCompletedViewMode("view")}
              variant="outline"
              className="gap-2 border-border text-muted-foreground hover:text-foreground rounded-lg active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dokumen
            </Button>
          )}
        </div>
      </div>

      {/* CONFIRMATION DIALOGS */}
      <ConfirmDialog
        isOpen={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        title="Pulihkan Versi PRD"
        description="Apakah Anda yakin ingin memulihkan versi ini menjadi versi aktif saat ini? Perubahan manual Anda saat ini akan dicadangkan secara otomatis."
        confirmLabel="Pulihkan"
        onConfirm={handleConfirmRestore}
        variant="success"
      />
      <ConfirmDialog
        isOpen={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        title="Batalkan Perubahan"
        description="Batalkan pengeditan? Seluruh perubahan manual dan AI yang belum disimpan di draf ini akan dibuang."
        confirmLabel="Buang Perubahan"
        onConfirm={handleConfirmCancelEdits}
        variant="destructive"
      />

      {/* WORKSPACE AREA */}
      {completedViewMode === "view" && (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch animate-fade-in-scale">
          {/* Left: TOC Sidebar */}
          <TocSidebar markdown={activePreviewText} containerRef={previewScrollRef} />

          {/* Center: Scrollable preview panel */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Alert when viewing historical version */}
            {viewingVersionId && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-scale">
                <div className="flex items-center gap-2.5">
                  <History className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">Menampilkan Versi Riwayat</p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      Anda sedang melihat &ldquo;{prdVersions.find((v) => v.id === viewingVersionId)?.label}&rdquo;.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => {
                      const ver = prdVersions.find((v) => v.id === viewingVersionId);
                      if (ver) handleTriggerRestore(ver.prdContent);
                    }}
                    className="h-8 text-[10px] px-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold"
                  >
                    Pulihkan Versi Ini
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingVersionId("")}
                    className="h-8 text-[10px] px-3 border-amber-500/20 hover:bg-amber-500/5 text-amber-400"
                  >
                    Tutup Pratinjau
                  </Button>
                </div>
              </div>
            )}

            {/* Action bar for document */}
            <div className="flex flex-wrap items-center gap-2 px-1">
              <Button
                onClick={handleDownloadPrd}
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 text-xs rounded-lg active:scale-[0.98]",
                  downloaded ? "text-emerald-400 border-emerald-500/30" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Download className="h-3.5 w-3.5" />
                {downloaded ? "Terunduh!" : "Unduh .md"}
              </Button>
              <Button
                onClick={handleCopyPrompt}
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 text-xs rounded-lg active:scale-[0.98]",
                  copiedPrompt ? "text-emerald-400 border-emerald-500/30" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Terminal className="h-3.5 w-3.5" />
                {copiedPrompt ? "Prompt Tersalin!" : "Salin Prompt AI"}
              </Button>
              <Button
                onClick={handleCopyPrd}
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 text-xs rounded-lg active:scale-[0.98]",
                  copiedPrd ? "text-emerald-400 border-emerald-500/30" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedPrd ? "PRD Tersalin!" : "Salin PRD"}
              </Button>
            </div>

            {/* Preview Body */}
            <ScrollArea ref={previewScrollRef} className="h-[600px] border border-border bg-card rounded-xl p-8 shadow-inner">
              <div className={proseClasses}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdHeadingComponents}>
                  {activePreviewText || "*Belum ada konten. PRD kosong.*"}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Version History Pane */}
          <div className="w-full lg:w-64 shrink-0 border-l border-border/60 pl-4 space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Riwayat Versi
              </span>
            </div>
            
            <ScrollArea className="h-[580px] pr-2">
              <div className="space-y-2">
                {prdVersions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-2">Belum ada riwayat versi.</p>
                ) : (
                  prdVersions.slice().reverse().map((ver) => {
                    const listIdx = prdVersions.indexOf(ver);
                    const activeIndex = prdVersions.map(v => v.prdContent).lastIndexOf(prdContent);
                    const isCurrent = listIdx === activeIndex;
                    const isSelected = ver.id === viewingVersionId;
                    const hasPrev = listIdx > 0;

                    return (
                      <div
                        key={ver.id}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all duration-200",
                          isSelected
                            ? "bg-primary/5 border-primary"
                            : "bg-secondary/40 border-border hover:border-zinc-700"
                        )}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-xs text-foreground line-clamp-1">{ver.label}</span>
                          {isCurrent && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-transparent text-[8px] h-4">
                              Aktif
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatRelativeTime(new Date(ver.createdAt))} • oleh {ver.createdBy === "ai" ? "AI" : "User"}
                        </p>
                        
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingVersionId(isSelected ? "" : ver.id)}
                            className="text-[10px] text-primary hover:underline font-semibold cursor-pointer active:scale-[0.98]"
                          >
                            {isSelected ? "Tutup" : "Lihat"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerRestore(ver.prdContent)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer active:scale-[0.98]"
                          >
                            Pulihkan
                          </button>
                          {hasPrev && (
                            <button
                              type="button"
                              onClick={() => handleToggleDiff(ver.id)}
                              className="text-[10px] text-muted-foreground hover:text-foreground font-semibold cursor-pointer active:scale-[0.98]"
                            >
                              Bandingkan
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {completedViewMode === "diff" && (
        <div className="space-y-4 animate-fade-in-scale">
          {/* Diff Header */}
          {(() => {
            const currentVerIdx = prdVersions.findIndex((v) => v.id === diffVersionId);
            const currentVer = prdVersions[currentVerIdx];
            const prevVer = currentVerIdx > 0 ? prdVersions[currentVerIdx - 1] : null;
            
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>Bandingkan:</span>
                  <span className="text-foreground">{currentVer?.label}</span>
                  <span>dengan</span>
                  <span className="text-foreground">{prevVer ? prevVer.label : "Draf Awal"}</span>
                </div>
                
                <VersionDiffView
                  oldText={prevVer ? prevVer.prdContent : ""}
                  newText={currentVer ? currentVer.prdContent : ""}
                />
              </div>
            );
          })()}
        </div>
      )}

      {completedViewMode === "edit" && (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch animate-fade-in-scale">
          {/* Left: Text Editor */}
          <div className="flex-1 min-w-0 flex flex-col space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-1">
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editor Teks Markdown (Draf Belum Disimpan)</span>
            </div>
            <textarea
              ref={completedEditRef}
              value={tempPrdContent}
              onChange={(e) => setTempPrdContent(e.target.value)}
              className="min-h-[550px] flex-1 w-full rounded-xl border border-border bg-card p-5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              placeholder="Edit konten PRD..."
              spellCheck={false}
            />
          </div>

          {/* Right: AI Chat Drawer */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col">
            <div className="flex h-[585px] flex-col rounded-xl border border-border bg-card shadow-lg">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-secondary rounded-t-xl">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Asisten AI (Draf Editor)
                </span>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Bot className="h-9 w-9 text-muted-foreground/40 mb-3" />
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Instruksikan asisten AI untuk memodifikasi atau merevisi draft editor saat ini.
                      </p>
                      <div className="mt-4 space-y-2 w-full max-w-xs">
                        {[
                          "Tambahkan bagian arsitektur database",
                          "Tulis detail alur otentikasi admin",
                          "Ubah gaya bahasa menjadi lebih formal",
                        ].map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setChatInput(suggestion)}
                            className="block w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground active:scale-[0.98]"
                          >
                            &ldquo;{suggestion}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-secondary text-foreground border border-border"
                        )}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex gap-1.5 rounded-xl bg-secondary border border-border px-4 py-3 items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-border p-3 bg-secondary rounded-b-xl">
                <div className="flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Minta AI merevisi draf..."
                    className="min-h-[40px] max-h-[80px] resize-none bg-card border-border text-xs rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCompletedChatSubmit();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleCompletedChatSubmit}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="shrink-0 bg-primary hover:bg-primary/90 rounded-lg h-9 w-9 active:scale-[0.98]"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
}

// Diff View Component
function VersionDiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const diffLines = computeLineDiff(oldText, newText);

  return (
    <div className="bg-[#0A0A0A] text-zinc-300 font-mono text-xs rounded-xl p-5 border border-border overflow-x-auto select-text leading-relaxed max-h-[600px]">
      {diffLines.map((line, idx) => {
        const isAdded = line.type === "added";
        const isRemoved = line.type === "removed";
        return (
          <div
            key={idx}
            className={cn(
              "px-3 py-0.5 rounded-sm flex gap-4 min-h-[20px]",
              isAdded && "bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500 pl-2.5",
              isRemoved && "bg-rose-950/40 text-rose-400 border-l-2 border-rose-500 pl-2.5"
            )}
          >
            <span className="w-6 select-none opacity-40 shrink-0 text-right font-semibold">
              {isAdded && "+"}
              {isRemoved && "-"}
              {!isAdded && !isRemoved && " "}
            </span>
            <span className="whitespace-pre-wrap flex-1">{line.content}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CompletedProjectViewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    }>
      <CompletedProjectViewContent />
    </Suspense>
  );
}
