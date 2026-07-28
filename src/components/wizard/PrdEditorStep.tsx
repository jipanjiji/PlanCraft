// ============================================================
// PlanCraft AI — Step 4: PRD Editor with AI Chat (Spacious & Modern)
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Bot,
  User,
  Edit3,
  Eye,
  MessageSquare,
  Loader2,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/types";

interface PrdEditorStepProps {
  prdContent: string;
  onPrdChange: (content: string) => void;
  chatMessages: ChatMessage[];
  onChatSubmit: (instruction: string) => void;
  onNext: () => void;
  onBack: () => void;
  isStreaming: boolean;
  isChatLoading: boolean;
}

export function PrdEditorStep({
  prdContent,
  onPrdChange,
  chatMessages,
  onChatSubmit,
  onNext,
  onBack,
  isStreaming,
  isChatLoading,
}: PrdEditorStepProps) {
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleChatSubmit = () => {
    if (!chatInput.trim() || isChatLoading) return;
    onChatSubmit(chatInput.trim());
    setChatInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Editor PRD & AI</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ubah spesifikasi secara langsung atau instruksikan AI Assistant untuk merevisi dokumen Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "gap-2 border-border text-xs rounded-lg px-4 py-2 transition-all",
              showChat
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            {showChat ? "Tutup Obrolan AI" : "Obrolan AI"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Workspace: Side-by-side or Tabbed */}
        <div className={cn("flex-1 min-w-0 transition-all duration-300", showChat ? "lg:w-3/5" : "w-full")}>
          {showChat ? (
            /* Tabbed layout when chat is open (to save space) */
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mb-4 bg-card border border-border rounded-lg self-start">
                <TabsTrigger value="edit" className="gap-2 text-xs rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary py-1.5 px-3">
                  <Edit3 className="h-3.5 w-3.5" />
                  Editor Teks
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2 text-xs rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary py-1.5 px-3">
                  <Eye className="h-3.5 w-3.5" />
                  Pratinjau PRD
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-0 flex-1 relative flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={prdContent}
                  onChange={(e) => onPrdChange(e.target.value)}
                  className="min-h-[520px] flex-1 w-full rounded-xl border border-border bg-[#0A0A0A] p-5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed shadow-inner"
                  placeholder="Isi konten PRD Anda akan muncul di sini..."
                  spellCheck={false}
                />
                {isStreaming && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-2 border border-primary/20 animate-pulse-glow">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-primary font-semibold">AI sedang menulis...</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="mt-0 flex-1 flex flex-col">
                <ScrollArea className="min-h-[520px] flex-1 rounded-xl border border-border bg-[#070707] p-8 shadow-inner">
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-h1:text-2xl prose-h1:font-bold prose-h1:pb-2 prose-h1:border-b prose-h1:border-zinc-800 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:text-zinc-200 prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:my-3 prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-pre:bg-card prose-pre:border prose-pre:border-border prose-ul:list-disc prose-ul:pl-5 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {prdContent || "*Belum ada konten. Ketikkan ide Anda di Editor Teks atau biarkan AI menuliskannya.*"}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            /* Beautiful Side-by-Side Split Pane (Editor + Preview) when chat is closed */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              
              {/* Left Pane: Rich Textarea */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editor Teks Markdown</span>
                </div>
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    ref={textareaRef}
                    value={prdContent}
                    onChange={(e) => onPrdChange(e.target.value)}
                    className="min-h-[550px] flex-1 w-full rounded-xl border border-border bg-[#0A0A0A] p-5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed shadow-inner"
                    placeholder="Isi konten PRD Anda akan muncul di sini..."
                    spellCheck={false}
                  />
                  {isStreaming && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-2 border border-primary/20 animate-pulse-glow">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="text-xs text-primary font-semibold">AI sedang menulis...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pane: Live Beautifully-Rendered Document */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Pratinjau Dokumen PRD</span>
                </div>
                <ScrollArea className="min-h-[550px] flex-1 rounded-xl border border-border bg-[#070707] p-8 shadow-inner">
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-h1:text-2xl prose-h1:font-bold prose-h1:pb-2 prose-h1:border-b prose-h1:border-zinc-800 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:text-zinc-200 prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:my-3 prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-pre:bg-card prose-pre:border prose-pre:border-border prose-ul:list-disc prose-ul:pl-5 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {prdContent || "*Belum ada konten. Ketikkan ide Anda di Editor Teks atau biarkan AI menuliskannya.*"}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </div>

            </div>
          )}
        </div>

        {/* Right Pane: AI Chat Drawer */}
        {showChat && (
          <div className="w-full lg:w-2/5 animate-slide-in-right flex flex-col">
            <div className="flex h-[585px] flex-col rounded-xl border border-border bg-card shadow-lg">
              {/* Chat Header */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-[#0A0A0A] rounded-t-xl">
                <Bot className="h-4.5 w-4.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Asisten AI
                </span>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Bot className="h-9 w-9 text-muted-foreground/40 mb-3" />
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Instruksikan asisten AI untuk memodifikasi atau memperluas bagian tertentu dalam PRD Anda secara instan.
                      </p>
                      <div className="mt-4 space-y-2 w-full max-w-xs">
                        {[
                          "Tambahkan bagian strategi caching database",
                          "Perluas penjelasan endpoint API",
                          "Ubah gaya bahasa menjadi lebih formal",
                        ].map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setChatInput(suggestion)}
                            className="block w-full rounded-lg border border-border bg-[#0A0A0A] px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
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
                            : "bg-[#0A0A0A] text-foreground border border-border"
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
                      <div className="flex gap-1.5 rounded-xl bg-[#0A0A0A] border border-border px-4 py-3 items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t border-border p-3 bg-[#0A0A0A] rounded-b-xl">
                <div className="flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanya AI untuk merevisi PRD..."
                    className="min-h-[40px] max-h-[80px] resize-none bg-card border-border text-xs rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="shrink-0 bg-primary hover:bg-primary/95 rounded-lg h-9 w-9"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 border-border text-muted-foreground hover:text-foreground rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button
          onClick={onNext}
          disabled={!prdContent.trim() || isStreaming}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg"
        >
          Buat Daftar Tugas
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
