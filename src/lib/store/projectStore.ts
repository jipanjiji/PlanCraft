// ============================================================
// PlanCraft AI — Project Zustand Store
// ============================================================

import { create } from "zustand";
import type {
  Project,
  WizardStep,
  ClarifyingQA,
  SystemStructure,
  Task,
  ChatMessage,
} from "@/lib/types";

interface ProjectState {
  // Current project
  project: Project | null;
  currentStep: WizardStep;
  isSaving: boolean;

  // AI streaming state
  isGenerating: boolean;
  streamedContent: string;

  // Chat messages for PRD refinement
  chatMessages: ChatMessage[];

  // Actions
  setProject: (project: Project | null) => void;
  setCurrentStep: (step: WizardStep) => void;
  updateProject: (updates: Partial<Project>) => void;
  setRawIdea: (rawIdea: string) => void;
  setTitle: (title: string) => void;
  setClarifyingQuestions: (questions: ClarifyingQA[]) => void;
  setSystemStructure: (structure: SystemStructure) => void;
  setPrdContent: (content: string) => void;
  setTasks: (tasks: Task[]) => void;
  toggleTaskCompleted: (taskId: string) => void;

  // AI streaming
  setIsGenerating: (generating: boolean) => void;
  setStreamedContent: (content: string) => void;
  appendStreamedContent: (chunk: string) => void;

  // Chat
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;

  // Saving
  setIsSaving: (saving: boolean) => void;

  // Reset
  reset: () => void;
}

const initialProject: Project = {
  id: "",
  userId: "",
  title: "",
  rawIdea: "",
  status: "draft",
  clarifyingQuestions: [],
  systemStructure: null,
  prdContent: "",
  tasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  currentStep: "idea",
  isSaving: false,
  isGenerating: false,
  streamedContent: "",
  chatMessages: [],

  setProject: (project) => set({ project }),
  setCurrentStep: (step) => set({ currentStep: step }),

  updateProject: (updates) => {
    const current = get().project;
    if (!current) return;
    set({ project: { ...current, ...updates, updatedAt: new Date() } });
  },

  setRawIdea: (rawIdea) => {
    const current = get().project;
    if (!current) return;
    set({ project: { ...current, rawIdea, updatedAt: new Date() } });
  },

  setTitle: (title) => {
    const current = get().project;
    if (!current) return;
    set({ project: { ...current, title, updatedAt: new Date() } });
  },

  setClarifyingQuestions: (questions) => {
    const current = get().project;
    if (!current) return;
    set({
      project: {
        ...current,
        clarifyingQuestions: questions,
        status: "clarifying",
        updatedAt: new Date(),
      },
    });
  },

  setSystemStructure: (structure) => {
    const current = get().project;
    if (!current) return;
    set({
      project: {
        ...current,
        systemStructure: structure,
        status: "structured",
        updatedAt: new Date(),
      },
    });
  },

  setPrdContent: (content) => {
    const current = get().project;
    if (!current) return;
    set({
      project: {
        ...current,
        prdContent: content,
        status: "prd_generated",
        updatedAt: new Date(),
      },
    });
  },

  setTasks: (tasks) => {
    const current = get().project;
    if (!current) return;
    set({
      project: {
        ...current,
        tasks,
        status: "completed",
        updatedAt: new Date(),
      },
    });
  },

  toggleTaskCompleted: (taskId) => {
    const current = get().project;
    if (!current) return;
    const tasks = current.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    set({ project: { ...current, tasks, updatedAt: new Date() } });
  },

  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setStreamedContent: (content) => set({ streamedContent: content }),
  appendStreamedContent: (chunk) =>
    set((state) => ({ streamedContent: state.streamedContent + chunk })),

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setChatMessages: (messages) => set({ chatMessages: messages }),

  setIsSaving: (saving) => set({ isSaving: saving }),

  reset: () =>
    set({
      project: null,
      currentStep: "idea",
      isSaving: false,
      isGenerating: false,
      streamedContent: "",
      chatMessages: [],
    }),
}));

export { initialProject };
