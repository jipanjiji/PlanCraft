// ============================================================
// PlanCraft AI — Wizard Step Page (Draft / Resume Flow)
// Syncs URL step parameters and uses custom confirm dialogs
// ============================================================

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { Sparkles } from "lucide-react";
import type {
  WizardStep,
  ClarifyingQA,
  SystemStructure,
  ChatMessage,
  Project,
  ProjectStatus,
  ClarifyingQuestion,
  PrdVersion,
} from "@/lib/types";

// Step Keys Map
const STEP_MAP_KEYS: WizardStep[] = ["idea", "questions", "structure", "prd", "tasks", "export"];
const STATUS_ORDER: ProjectStatus[] = ["draft", "clarifying", "structured", "prd_generated", "completed"];

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

function getStepFromParam(param: string | null): WizardStep | null {
  if (!param) return null;
  const num = parseInt(param, 10);
  if (num >= 1 && num <= 6) {
    return STEP_MAP_KEYS[num - 1];
  }
  if (STEP_MAP_KEYS.includes(param as WizardStep)) {
    return param as WizardStep;
  }
  return null;
}

function getFarthestAllowedStep(status: ProjectStatus): WizardStep {
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

function isStepAllowed(step: WizardStep, status: ProjectStatus): boolean {
  const stepIdx = STEP_MAP_KEYS.indexOf(step);
  const maxAllowedStep = getFarthestAllowedStep(status);
  const maxIdx = STEP_MAP_KEYS.indexOf(maxAllowedStep);
  return stepIdx <= maxIdx;
}

function ProjectPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { fetchJson, stream } = useAiStream();

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<WizardStep>("idea");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [accessToken, setAccessToken] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("draft");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Project data
  const [rawIdea, setRawIdea] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<ClarifyingQA[]>([]);
  const [structure, setStructure] = useState<SystemStructure | null>(null);
  const [prdContent, setPrdContent] = useState("");
  const [prdVersions, setPrdVersions] = useState<PrdVersion[]>([]);
  const [tasks, setTasks] = useState<
    { id: string; title: string; category: string; description: string; completed: boolean }[]
  >([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Dialog states
  const [isPrdConfirmOpen, setIsPrdConfirmOpen] = useState(false);
  const [pendingStructure, setPendingStructure] = useState<SystemStructure | null>(null);
  const [isTasksConfirmOpen, setIsTasksConfirmOpen] = useState(false);

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

        // Redirect finished projects immediately to the dedicated finish page if no specific step is passed
        const stepParam = searchParams.get("step");
        if (project.status === "completed" && !stepParam) {
          setIsRedirecting(true);
          router.replace(`/project/${projectId}/finish`);
          return;
        }

        setRawIdea(project.rawIdea);
        setTitle(project.title);
        setAnswers(project.clarifyingQuestions);
        setStructure(project.systemStructure);
        setPrdContent(project.prdContent);
        setPrdVersions(project.prdVersions || []);
        setTasks(project.tasks as Project["tasks"]);
        setProjectStatus(project.status);

        // Load or generate questions
        if (project.generatedQuestions && project.generatedQuestions.length > 0) {
          setQuestions(project.generatedQuestions);
        } else {
          setQuestions(project.clarifyingQuestions.map((q) => ({ question: q.question, options: [] })));
        }
        
        let token = project.accessToken;
        if (!token) {
          token = generateId() + generateId();
          await updateProject(projectId, { accessToken: token });
        }
        setAccessToken(token);

        // Determine step from URL or fallback
        const targetStep = getStepFromParam(stepParam);
        if (targetStep && isStepAllowed(targetStep, project.status)) {
          setCurrentStep(targetStep);
        } else {
          const fallbackStep = statusToStep(project.status);
          setCurrentStep(fallbackStep);
          router.replace(`/project/${projectId}?step=${STEP_MAP_KEYS.indexOf(fallbackStep) + 1}`);
        }

      } catch (error) {
        console.error("Failed to load project:", error);
        setIsRedirecting(true);
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [user, projectId, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize URL step parameter when currentStep changes
  useEffect(() => {
    if (loading || isRedirecting) return;
    const currentStepNum = STEP_MAP_KEYS.indexOf(currentStep) + 1;
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get("step");

    if (stepParam !== String(currentStepNum)) {
      router.replace(`/project/${projectId}?step=${currentStepNum}`);
    }
  }, [currentStep, loading, isRedirecting, projectId, router]);

  // Helper to save project to Firestore (maintains status progression lock)
  const saveProject = useCallback(
    async (updates: Partial<Project>) => {
      try {
        const finalUpdates = { ...updates };
        if (updates.status) {
          const oldIdx = STATUS_ORDER.indexOf(projectStatus);
          const newIdx = STATUS_ORDER.indexOf(updates.status);
          const nextStatus = newIdx > oldIdx ? updates.status : projectStatus;
          setProjectStatus(nextStatus);
          finalUpdates.status = nextStatus;
        }
        await updateProject(projectId, finalUpdates as Partial<Project>);
      } catch (error) {
        console.error("Failed to save project:", error);
      }
    },
    [projectId, projectStatus]
  );

  // Handlers
  const handleIdeaSubmit = async (idea: string, projectTitle: string) => {
    setRawIdea(idea);
    setTitle(projectTitle);
    setIsLoading(true);
    try {
      const data = await fetchJson<{ questions: ClarifyingQuestion[] }>("/api/ai/questions", { rawIdea: idea });
      setQuestions(data.questions);
      setCurrentStep("questions");
      await saveProject({
        rawIdea: idea,
        title: projectTitle,
        status: "clarifying",
        generatedQuestions: data.questions,
      });
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

  // Triggers PRD generation
  const runPrdGeneration = async (struct: SystemStructure) => {
    setIsLoading(true);
    setIsStreaming(true);
    setPrdContent("");
    setCurrentStep("prd");
    try {
      const fullContent = await stream("/api/ai/generate-prd", { rawIdea, answers, structure: struct });
      const initialContent = fullContent || "";
      setPrdContent(initialContent);

      const initialVer: PrdVersion = {
        id: generateId(),
        prdContent: initialContent,
        createdAt: new Date(),
        createdBy: "ai",
        label: "Versi 1: Konten Awal (AI)",
      };
      setPrdVersions([initialVer]);

      await saveProject({
        systemStructure: struct,
        prdContent: initialContent,
        prdVersions: [initialVer],
        status: "prd_generated",
      });
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleApproveStructure = async (updatedStructure: SystemStructure) => {
    setStructure(updatedStructure);

    // If PRD already exists, show custom confirmation dialog
    if (prdContent.trim()) {
      setPendingStructure(updatedStructure);
      setIsPrdConfirmOpen(true);
    } else {
      await runPrdGeneration(updatedStructure);
    }
  };

  // Called when user decides not to regenerate PRD and uses the existing one
  const handleCancelPrdRegen = async () => {
    if (pendingStructure) {
      setCurrentStep("prd");
      await saveProject({ systemStructure: pendingStructure });
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
        
        const newVer: PrdVersion = {
          id: generateId(),
          prdContent: fullContent,
          createdAt: new Date(),
          createdBy: "ai",
          label: `Versi ${prdVersions.length + 1}: AI Refinement (Obrolan)`,
        };
        const updated = [...prdVersions, newVer];
        setPrdVersions(updated);

        await saveProject({ prdContent: fullContent, prdVersions: updated });
      }
    } catch {
      setChatMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: "Error occurred. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePrdBack = async () => {
    const latestVersion = prdVersions[prdVersions.length - 1];
    const updatedVersions = [...prdVersions];
    if (prdContent.trim() && (!latestVersion || latestVersion.prdContent !== prdContent)) {
      const manualVer: PrdVersion = {
        id: generateId(),
        prdContent: prdContent,
        createdAt: new Date(),
        createdBy: "user",
        label: `Versi ${prdVersions.length + 1}: Edit Manual (User)`,
      };
      updatedVersions.push(manualVer);
      setPrdVersions(updatedVersions);
      await saveProject({ prdContent, prdVersions: updatedVersions });
    }
    setCurrentStep("structure");
  };

  // Triggers tasks generation
  const runTasksGeneration = async (updatedVersions: PrdVersion[]) => {
    setIsLoading(true);
    setCurrentStep("tasks");
    try {
      const data = await fetchJson<{ tasks: Project["tasks"] }>("/api/ai/generate-tasks", { prdContent, projectTitle: title });
      setTasks(data.tasks);
      await saveProject({
        prdContent,
        prdVersions: updatedVersions,
        tasks: data.tasks as Project["tasks"],
        status: "completed",
      });
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTasks = async () => {
    // Save manual edits as a version before generating tasks
    const latestVersion = prdVersions[prdVersions.length - 1];
    const updatedVersions = [...prdVersions];
    if (prdContent.trim() && (!latestVersion || latestVersion.prdContent !== prdContent)) {
      const manualVer: PrdVersion = {
        id: generateId(),
        prdContent: prdContent,
        createdAt: new Date(),
        createdBy: "user",
        label: `Versi ${prdVersions.length + 1}: Edit Manual (User)`,
      };
      updatedVersions.push(manualVer);
      setPrdVersions(updatedVersions);
    }

    // Smart confirmation: skip tasks regeneration if tasks exist
    if (tasks.length > 0) {
      setIsTasksConfirmOpen(true);
    } else {
      await runTasksGeneration(updatedVersions);
    }
  };

  // Called when user decides not to regenerate tasks and moves forward
  const handleCancelTasksRegen = async () => {
    setCurrentStep("tasks");
  };

  const handleRestoreVersion = async (restoredContent: string) => {
    setPrdContent(restoredContent);
    await saveProject({
      prdContent: restoredContent,
    });
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const currentProject: Project = {
    id: projectId,
    userId: user?.uid || "",
    title: title || "Untitled Project",
    rawIdea,
    status: projectStatus,
    clarifyingQuestions: answers,
    systemStructure: structure,
    prdContent,
    tasks: tasks as Project["tasks"],
    accessToken,
    prdVersions,
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
      {/* Wizard Confirmations */}
      <ConfirmDialog
        isOpen={isPrdConfirmOpen}
        onOpenChange={setIsPrdConfirmOpen}
        title="Buat Ulang PRD?"
        description="Dokumen PRD sudah ada. Apakah Anda ingin membuat ulang (regenerate) PRD baru berdasarkan struktur ini? Perubahan manual Anda saat ini akan disimpan dalam Riwayat Versi. Klik 'Batal' untuk langsung menggunakan PRD yang ada."
        confirmLabel="Buat Ulang"
        cancelLabel="Gunakan yang Ada"
        onConfirm={() => pendingStructure && runPrdGeneration(pendingStructure)}
        onCancel={handleCancelPrdRegen}
        variant="warning"
      />
      <ConfirmDialog
        isOpen={isTasksConfirmOpen}
        onOpenChange={setIsTasksConfirmOpen}
        title="Buat Ulang Daftar Tugas?"
        description="Daftar tugas sudah ada. Apakah Anda ingin membuat ulang (regenerate) daftar tugas baru berdasarkan PRD saat ini?"
        confirmLabel="Buat Ulang"
        cancelLabel="Gunakan yang Ada"
        onConfirm={() => runTasksGeneration(prdVersions)}
        onCancel={handleCancelTasksRegen}
        variant="warning"
      />

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
          <PrdEditorStep
            prdContent={prdContent}
            onPrdChange={setPrdContent}
            prdVersions={prdVersions}
            onRestoreVersion={handleRestoreVersion}
            chatMessages={chatMessages}
            onChatSubmit={handleChatSubmit}
            onNext={handleGenerateTasks}
            onBack={handlePrdBack}
            isStreaming={isStreaming}
            isChatLoading={isChatLoading}
          />
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

export default function ProjectPage() {
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
      <ProjectPageContent />
    </Suspense>
  );
}
