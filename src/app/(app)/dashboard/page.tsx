// ============================================================
// PlanCraft AI — Dashboard Page
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserProjects,
  deleteProject,
  duplicateProject,
} from "@/lib/firebase/firestore";
import {
  compileProjectMarkdown,
  downloadMarkdown,
} from "@/lib/utils/markdown-compiler";
import { generateId, slugify } from "@/lib/utils/helpers";
import { Plus, Search, FolderOpen, Sparkles } from "lucide-react";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getUserProjects(user.uid);
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserProjects(user.uid);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rawIdea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = (id: string) => {
    router.push(`/project/${id}`);
  };

  const handleDuplicate = async (project: Project) => {
    if (!user) return;
    try {
      const newId = generateId();
      await duplicateProject(project, newId, user.uid);
      await loadProjects();
    } catch (error) {
      console.error("Failed to duplicate:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleDownload = (project: Project) => {
    const md = compileProjectMarkdown(project);
    downloadMarkdown(md, `${slugify(project.title || "project-spec")}.md`);
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyek Saya</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} proyek di ruang kerja Anda
          </p>
        </div>
        <Button
          onClick={() => router.push("/project/new")}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Proyek Baru
        </Button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari proyek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 bg-card border-border pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card/50 p-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="mt-4 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-3/4" />
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Belum ada proyek
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Mulai dengan membuat proyek pertama Anda. Jelaskan ide Anda dan biarkan AI membuat PRD lengkap untuk Anda.
          </p>
          <Button
            onClick={() => router.push("/project/new")}
            className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg"
          >
            <Sparkles className="h-4 w-4" />
            Buat Proyek Pertama Anda
          </Button>
        </div>
      )}

      {/* Project Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, i) => (
            <div
              key={project.id}
              className={`stagger-${Math.min(i + 1, 5)} animate-fade-in`}
            >
              <ProjectCard
                project={project}
                onOpen={handleOpen}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Tidak ada proyek yang cocok dengan &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
