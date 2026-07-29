// ============================================================
// PlanCraft AI — Step 5: Task Breakdown (Indonesian)
// ============================================================

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Circle,
  ListChecks,
  Wrench,
  Database,
  Server,
  Layout,
  TestTube,
  Rocket,
} from "lucide-react";
import type { Task, TaskCategory } from "@/lib/types";

interface TaskBreakdownStepProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onRegenerate: () => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  setup: { label: "Konfigurasi & Inisialisasi", icon: Wrench, color: "text-zinc-400" },
  database: { label: "Database", icon: Database, color: "text-emerald-400" },
  backend: { label: "Backend", icon: Server, color: "text-blue-400" },
  frontend: { label: "Frontend / Tampilan", icon: Layout, color: "text-purple-400" },
  testing: { label: "Pengujian / Testing", icon: TestTube, color: "text-amber-400" },
  deployment: { label: "Rilis / Deployment", icon: Rocket, color: "text-rose-400" },
};

const CATEGORY_ORDER: TaskCategory[] = [
  "setup",
  "database",
  "backend",
  "frontend",
  "testing",
  "deployment",
];

export function TaskBreakdownStep({
  tasks,
  onToggleTask,
  onRegenerate,
  onNext,
  onBack,
  isLoading,
}: TaskBreakdownStepProps) {
  // Group tasks by category
  const grouped = tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    },
    {} as Record<TaskCategory, Task[]>
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
          <ListChecks className="h-7 w-7 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Daftar Tugas Pengembangan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {totalCount} tugas telah dihasilkan di {Object.keys(grouped).length} fase pengembangan.
          Tandai tugas yang sudah atau ingin Anda rencanakan.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{completedCount} / {totalCount} selesai direncanakan</span>
          <span className="font-mono">{Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Task Categories */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const categoryTasks = grouped[category];
          if (!categoryTasks || categoryTasks.length === 0) return null;
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <h3 className="text-sm font-semibold text-foreground">
                  {config.label}
                </h3>
                <Badge
                  variant="outline"
                  className="ml-auto border-border text-xs text-muted-foreground font-normal py-0.5 px-2 rounded-full"
                >
                  {categoryTasks.length} tugas
                </Badge>
              </div>

              <div className="space-y-2">
                {categoryTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`border-border bg-card/40 transition-all duration-200 cursor-pointer hover:bg-card/75 rounded-xl active:scale-[0.98] ${
                      task.completed ? "opacity-50" : ""
                    }`}
                    onClick={() => onToggleTask(task.id)}
                  >
                    <CardContent className="flex items-start gap-3.5 p-4">
                      <button className="mt-0.5 shrink-0">
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 border-border text-muted-foreground hover:text-foreground rounded-lg active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading}
            className="gap-2 border-border text-muted-foreground hover:text-foreground rounded-lg active:scale-[0.98]"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Buat Ulang
          </Button>
          <Button
            onClick={onNext}
            disabled={isLoading}
            size="lg"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98]"
          >
            Ekspor Spesifikasi
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
