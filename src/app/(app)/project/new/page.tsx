// ============================================================
// PlanCraft AI — New Project Wizard Page
// ============================================================

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAiStream } from "@/hooks/useAiStream";

import { createProject, updateProject } from "@/lib/firebase/firestore";
import { generateId } from "@/lib/utils/helpers";
import { WizardShell } from "@/components/wizard/WizardShell";
import { IdeaInputStep } from "@/components/wizard/IdeaInputStep";
import { QuestionsStep } from "@/components/wizard/QuestionsStep";
import { StructureStep } from "@/components/wizard/StructureStep";
import { PrdEditorStep } from "@/components/wizard/PrdEditorStep";
import { TaskBreakdownStep } from "@/components/wizard/TaskBreakdownStep";
import { ExportStep } from "@/components/wizard/ExportStep";
import type {
  WizardStep,
  ClarifyingQA,
  SystemStructure,
  ChatMessage,
  Project,
  ClarifyingQuestion,
} from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { fetchJson, stream } = useAiStream();

  // Local wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("idea");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [projectId] = useState(() => generateId());
  const [accessToken] = useState(() => generateId() + generateId());

  // Project data
  const [rawIdea, setRawIdea] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<ClarifyingQA[]>([]);
  const [structure, setStructure] = useState<SystemStructure | null>(null);
  const [prdContent, setPrdContent] = useState("");
  const [tasks, setTasks] = useState<
    { id: string; title: string; category: string; description: string; completed: boolean }[]
  >([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Helper to save project to Firestore
  const saveProject = useCallback(
    async (updates: Partial<Project>) => {
      if (!user) return;
      try {
        const projectData: Omit<Project, "createdAt" | "updatedAt"> = {
          id: projectId,
          userId: user.uid,
          title: title || "Untitled Project",
          rawIdea,
          status: "draft" as const,
          clarifyingQuestions: answers,
          systemStructure: structure,
          prdContent,
          tasks: tasks as Project["tasks"],
          accessToken,
          ...updates,
        };

        // Try updating first, create if it doesn't exist
        try {
          await updateProject(projectId, projectData);
        } catch {
          await createProject(projectData);
        }
      } catch (error) {
        console.error("Failed to save project:", error);
      }
    },
    [user, projectId, title, rawIdea, answers, structure, prdContent, tasks, accessToken]
  );

  // --- Step 1: Submit Idea ---
  const handleIdeaSubmit = async (idea: string, projectTitle: string) => {
    setRawIdea(idea);
    setTitle(projectTitle);
    setIsLoading(true);

    try {
      const data = await fetchJson<{ questions: ClarifyingQuestion[] }>(
        "/api/ai/questions",
        { rawIdea: idea }
      );
      setQuestions(data.questions);
      setCurrentStep("questions");
      await saveProject({ rawIdea: idea, title: projectTitle, status: "clarifying" });
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Gagal menghasilkan pertanyaan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Submit Answers ---
  const handleAnswersSubmit = async (qa: ClarifyingQA[]) => {
    setAnswers(qa);
    setIsLoading(true);

    try {
      const data = await fetchJson<SystemStructure>("/api/ai/structure", {
        rawIdea,
        answers: qa,
      });
      setStructure(data);
      setCurrentStep("structure");
      await saveProject({ clarifyingQuestions: qa, status: "structured" });
    } catch (error) {
      console.error("Failed to generate structure:", error);
      alert("Gagal menghasilkan struktur. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Approve Structure & Generate PRD ---
  const handleApproveStructure = async () => {
    if (!structure) return;
    setIsLoading(true);
    setIsStreaming(true);
    setPrdContent("");
    setCurrentStep("prd");

    try {
      const fullContent = await stream("/api/ai/generate-prd", {
        rawIdea,
        answers,
        structure,
      });
      setPrdContent(fullContent || "");
      await saveProject({
        systemStructure: structure,
        prdContent: fullContent || "",
        status: "prd_generated",
      });
    } catch (error) {
      console.error("Failed to generate PRD:", error);
      alert("Gagal menghasilkan PRD. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // --- Step 3: Regenerate Structure ---
  const handleRegenerateStructure = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<SystemStructure>("/api/ai/structure", {
        rawIdea,
        answers,
      });
      setStructure(data);
    } catch (error) {
      console.error("Failed to regenerate structure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 4: Chat Refinement ---
  const handleChatSubmit = async (instruction: string) => {
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
        currentPrd: prdContent,
        messages: [...chatMessages, userMessage],
        instruction,
      });

      if (fullContent) {
        setPrdContent(fullContent);
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "Saya telah memperbarui PRD sesuai permintaan Anda. Silakan cek editor untuk melihat perubahannya.",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
        await saveProject({ prdContent: fullContent });
      }
    } catch (error) {
      console.error("Chat refinement failed:", error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat memperbarui PRD. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Step 4 → Step 5: Generate Tasks ---
  const handleGenerateTasks = async () => {
    setIsLoading(true);
    setCurrentStep("tasks");

    try {
      const data = await fetchJson<{
        tasks: {
          id: string;
          title: string;
          category: string;
          description: string;
          completed: boolean;
        }[];
      }>("/api/ai/generate-tasks", {
        prdContent,
        projectTitle: title || "Untitled Project",
      });
      setTasks(data.tasks);
      await saveProject({ tasks: data.tasks as Project["tasks"], status: "completed" });
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      alert("Gagal menghasilkan daftar tugas. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Task toggle ---
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // Build the current project object for the export step
  const currentProject: Project = {
    id: projectId,
    userId: user?.uid || "",
    title: title || "Untitled Project",
    rawIdea,
    status: "completed",
    clarifyingQuestions: answers,
    systemStructure: structure,
    prdContent,
    tasks: tasks as Project["tasks"],
    accessToken,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="py-4">
      <WizardShell currentStep={currentStep}>
        {currentStep === "idea" && (
          <IdeaInputStep
            initialIdea={rawIdea}
            initialTitle={title}
            onSubmit={handleIdeaSubmit}
            isLoading={isLoading}
          />
        )}

        {currentStep === "questions" && (
          <QuestionsStep
            questions={questions}
            initialAnswers={answers}
            onSubmit={handleAnswersSubmit}
            onBack={() => setCurrentStep("idea")}
            isLoading={isLoading}
          />
        )}

        {currentStep === "structure" && structure && (
          <StructureStep
            structure={structure}
            onApprove={handleApproveStructure}
            onRegenerate={handleRegenerateStructure}
            onBack={() => setCurrentStep("questions")}
            isLoading={isLoading}
          />
        )}

        {currentStep === "prd" && (
          <PrdEditorStep
            prdContent={prdContent}
            onPrdChange={setPrdContent}
            chatMessages={chatMessages}
            onChatSubmit={handleChatSubmit}
            onNext={handleGenerateTasks}
            onBack={() => setCurrentStep("structure")}
            isStreaming={isStreaming}
            isChatLoading={isChatLoading}
          />
        )}

        {currentStep === "tasks" && (
          <TaskBreakdownStep
            tasks={tasks as Project["tasks"]}
            onToggleTask={handleToggleTask}
            onRegenerate={handleGenerateTasks}
            onNext={() => setCurrentStep("export")}
            onBack={() => setCurrentStep("prd")}
            isLoading={isLoading}
          />
        )}

        {currentStep === "export" && (
          <ExportStep
            project={currentProject}
            onBack={() => setCurrentStep("tasks")}
            onGoToDashboard={() => router.push("/dashboard")}
          />
        )}
      </WizardShell>
    </div>
  );
}
