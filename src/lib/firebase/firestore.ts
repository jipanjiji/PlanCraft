// ============================================================
// PlanCraft AI — Firestore Database Operations
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { Project, Conversation } from "@/lib/types";

// --- Projects ---
const projectsCol = () => collection(db, "projects");

export async function createProject(project: Omit<Project, "createdAt" | "updatedAt">) {
  const ref = doc(projectsCol(), project.id);
  await setDoc(ref, {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return project.id;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const ref = doc(projectsCol(), projectId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  } as Project;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const q = query(
    projectsCol(),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
    } as Project;
  });
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
) {
  const ref = doc(projectsCol(), projectId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string) {
  const ref = doc(projectsCol(), projectId);
  await deleteDoc(ref);
}

export async function duplicateProject(
  project: Project,
  newId: string,
  userId: string
) {
  const duplicate: Omit<Project, "createdAt" | "updatedAt"> = {
    ...project,
    id: newId,
    userId,
    title: `${project.title} (Copy)`,
  };
  return createProject(duplicate);
}

// --- Conversations ---
const conversationsCol = () => collection(db, "conversations");

export async function getConversation(
  projectId: string
): Promise<Conversation | null> {
  const q = query(
    conversationsCol(),
    where("projectId", "==", projectId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { ...doc.data(), id: doc.id } as Conversation;
}

export async function saveConversation(conversation: Conversation) {
  const ref = doc(conversationsCol(), conversation.id);
  await setDoc(ref, conversation, { merge: true });
}
