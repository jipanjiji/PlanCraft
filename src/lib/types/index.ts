// ============================================================
// PlanCraft AI — Core Type Definitions
// ============================================================

// --- User ---
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

// --- Project ---
export type ProjectStatus =
  | "draft"
  | "clarifying"
  | "structured"
  | "prd_generated"
  | "completed";

export interface ClarifyingQA {
  question: string;
  answer: string;
}

export interface SystemStructure {
  scale: string;
  overview: string;
  coreFeatures: string[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
    extras: string[];
  };
  architecture: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  completed: boolean;
}

export type TaskCategory =
  | "setup"
  | "database"
  | "backend"
  | "frontend"
  | "testing"
  | "deployment";

export interface Project {
  id: string;
  userId: string;
  title: string;
  rawIdea: string;
  status: ProjectStatus;
  clarifyingQuestions: ClarifyingQA[];
  systemStructure: SystemStructure | null;
  prdContent: string;
  tasks: Task[];
  accessToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Conversation (AI Chat for PRD refinement) ---
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  projectId: string;
  messages: ChatMessage[];
}

// --- Wizard Step ---
export type WizardStep =
  | "idea"
  | "questions"
  | "structure"
  | "prd"
  | "tasks"
  | "export";

export const WIZARD_STEPS: { key: WizardStep; label: string; number: number }[] = [
  { key: "idea", label: "Ide Proyek", number: 1 },
  { key: "questions", label: "Klarifikasi", number: 2 },
  { key: "structure", label: "Struktur", number: 3 },
  { key: "prd", label: "Editor PRD", number: 4 },
  { key: "tasks", label: "Daftar Tugas", number: 5 },
  { key: "export", label: "Ekspor", number: 6 },
];

// --- API Request/Response Types ---
export interface QuestionsRequest {
  rawIdea: string;
}

export interface ClarifyingQuestion {
  question: string;
  options: string[];
}

export interface QuestionsResponse {
  questions: ClarifyingQuestion[];
}

export interface StructureRequest {
  rawIdea: string;
  answers: ClarifyingQA[];
}

export interface GeneratePrdRequest {
  rawIdea: string;
  answers: ClarifyingQA[];
  structure: SystemStructure;
}

export interface ChatRefineRequest {
  currentPrd: string;
  messages: ChatMessage[];
  instruction: string;
}

export interface GenerateTasksRequest {
  prdContent: string;
  projectTitle: string;
}
