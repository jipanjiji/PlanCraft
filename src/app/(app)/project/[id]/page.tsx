// ============================================================
// PlanCraft AI — Resume Existing Project Page
// ============================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAiStream } from "@/hooks/useAiStream";
import { getProject, updateProject } from "@/lib/firebase/firestore";
import { generateId } from "@/lib/utils/helpers";
import { WizardShell } from "@/components/wizard/WizardShell";
import { IdeaInputStep } from "@/components/wizard/IdeaInputStep";
import { QuestionsStep } from "@/components/wizard/QuestionsStep";
import { StructureStep } from "@/components/wizard/StructureStep";
import { PrdEditorStep } from "@/components/wizard/PrdEditorStep";
import { TaskBreakdownStep } from "@/components/wizard/TaskBreakdownStep";
import { ExportStep } from "@/components/wizard/ExportStep";

import { Sparkles } from "lucide-react";
import type {
  WizardStep,
  ClarifyingQA,
  SystemStructure,
  ChatMessage,
  Project,
  ProjectStatus,
  ClarifyingQuestion,
} from "@/lib/types";

// Map project status to wizard step
function statusToStep(status: ProjectStatus): WizardStep {
  switch (status) {
    case "draft":
      return "idea";
    case "clarifying":
      return "questions";
    case "structured":
      return "structure";
    case "prd_generated":
      return "prd";
    case "completed":
      return "export";
    default:
      return "idea";
  }
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { fetchJson, stream } = useAiStream();

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<WizardStep>("idea");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [accessToken, setAccessToken] = useState("");

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

  // Load existing project
  useEffect(() => {
    if (!user || !projectId) return;

    const loadProject = async () => {
      try {
        const project = await getProject(projectId);
        if (!project || project.userId !== user.uid) {
          router.replace("/dashboard");
          return;
        }

        setRawIdea(project.rawIdea);
        setTitle(project.title);
        setAnswers(project.clarifyingQuestions);
        setQuestions(project.clarifyingQuestions.map((q) => ({ question: q.question, options: [] })));
        setStructure(project.systemStructure);
        setPrdContent(project.prdContent);
        setTasks(project.tasks as Project["tasks"]);
        
        let token = project.accessToken;
        if (!token) {
          token = generateId() + generateId();
          await updateProject(projectId, { accessToken: token });
        }
        setAccessToken(token);

        setCurrentStep(statusToStep(project.status));
      } catch (error) {
        console.error("Failed to load project:", error);
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [user, projectId, router]);

  const saveProject = useCallback(
    async (updates: Partial<Project>) => {
      try {
        await updateProject(projectId, updates as Partial<Project>);
      } catch (error) {
        console.error("Failed to save project:", error);
      }
    },
    [projectId]
  );

  // All the same handlers as new project page
  const handleIdeaSubmit = async (idea: string, projectTitle: string) => {
    setRawIdea(idea);
    setTitle(projectTitle);
    setIsLoading(true);
    try {
      const data = await fetchJson<{ questions: ClarifyingQuestion[] }>("/api/ai/questions", { rawIdea: idea });
      setQuestions(data.questions);
      setCurrentStep("questions");
      await saveProject({ rawIdea: idea, title: projectTitle, status: "clarifying" });
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswersSubmit = async (qa: ClarifyingQA[]) => {
    setAnswers(qa);
    setIsLoading(true);
    try {
      const data = await fetchJson<SystemStructure>("/api/ai/structure", { rawIdea, answers: qa });
      setStructure(data);
      setCurrentStep("structure");
      await saveProject({ clarifyingQuestions: qa, status: "structured" });
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveStructure = async () => {
    if (!structure) return;
    setIsLoading(true);
    setIsStreaming(true);
    setPrdContent("");
    setCurrentStep("prd");
    try {
      const fullContent = await stream("/api/ai/generate-prd", { rawIdea, answers, structure });
      setPrdContent(fullContent || "");
      await saveProject({ prdContent: fullContent || "", status: "prd_generated" });
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleRegenerateStructure = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<SystemStructure>("/api/ai/structure", { rawIdea, answers });
      setStructure(data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (instruction: string) => {
    const userMessage: ChatMessage = { id: generateId(), role: "user", content: instruction, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);
    try {
      const fullContent = await stream("/api/ai/chat-refine", { currentPrd: prdContent, messages: [...chatMessages, userMessage], instruction });
      if (fullContent) {
        setPrdContent(fullContent);
        setChatMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: "PRD updated. Check the editor.", timestamp: new Date() }]);
        await saveProject({ prdContent: fullContent });
      }
    } catch {
      setChatMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: "Error occurred. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateTasks = async () => {
    setIsLoading(true);
    setCurrentStep("tasks");
    try {
      const data = await fetchJson<{ tasks: Project["tasks"] }>("/api/ai/generate-tasks", { prdContent, projectTitle: title });
      setTasks(data.tasks);
      await saveProject({ tasks: data.tasks as Project["tasks"], status: "completed" });
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

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
    <div className="py-4">
      <WizardShell currentStep={currentStep}>
        {currentStep === "idea" && (
          <IdeaInputStep initialIdea={rawIdea} initialTitle={title} onSubmit={handleIdeaSubmit} isLoading={isLoading} />
        )}
        {currentStep === "questions" && (
          <QuestionsStep questions={questions} initialAnswers={answers} onSubmit={handleAnswersSubmit} onBack={() => setCurrentStep("idea")} isLoading={isLoading} />
        )}
        {currentStep === "structure" && structure && (
          <StructureStep structure={structure} onApprove={handleApproveStructure} onRegenerate={handleRegenerateStructure} onBack={() => setCurrentStep("questions")} isLoading={isLoading} />
        )}
        {currentStep === "prd" && (
          <PrdEditorStep prdContent={prdContent} onPrdChange={setPrdContent} chatMessages={chatMessages} onChatSubmit={handleChatSubmit} onNext={handleGenerateTasks} onBack={() => setCurrentStep("structure")} isStreaming={isStreaming} isChatLoading={isChatLoading} />
        )}
        {currentStep === "tasks" && (
          <TaskBreakdownStep tasks={tasks as Project["tasks"]} onToggleTask={handleToggleTask} onRegenerate={handleGenerateTasks} onNext={() => setCurrentStep("export")} onBack={() => setCurrentStep("prd")} isLoading={isLoading} />
        )}
        {currentStep === "export" && (
          <ExportStep project={currentProject} onBack={() => setCurrentStep("tasks")} onGoToDashboard={() => router.push("/dashboard")} />
        )}
      </WizardShell>
    </div>
  );
}
