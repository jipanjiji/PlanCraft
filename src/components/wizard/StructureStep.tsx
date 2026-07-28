// ============================================================
// PlanCraft AI — Step 3: Structure Review (Indonesian & Premium UI)
// ============================================================

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Layers,
  Code2,
  Database,
  Rocket,
  Puzzle,
  LayoutGrid,
  Server,
} from "lucide-react";
import type { SystemStructure } from "@/lib/types";

interface StructureStepProps {
  structure: SystemStructure;
  onApprove: () => void;
  onRegenerate: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const SCALE_LABELS: Record<string, { label: string; class: string }> = {
  small: { label: "Skala Kecil", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  medium: { label: "Skala Menengah", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  large: { label: "Skala Besar", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  enterprise: { label: "Skala Enterprise", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const STACK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  frontend: LayoutGrid,
  backend: Server,
  database: Database,
  deployment: Rocket,
};

const STACK_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  deployment: "Deployment",
};

export function StructureStep({
  structure,
  onApprove,
  onRegenerate,
  onBack,
  isLoading,
}: StructureStepProps) {
  const scaleInfo = SCALE_LABELS[structure.scale] || SCALE_LABELS.medium;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
          <Layers className="h-7 w-7 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Usulan Struktur Sistem
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Tinjau arsitektur dan tech stack yang direkomendasikan untuk proyek Anda sebelum membuat PRD lengkap.
        </p>
      </div>

      {/* Scale Badge */}
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={`px-4 py-1.5 text-xs font-semibold rounded-full tracking-wide uppercase ${scaleInfo.class}`}
        >
          {scaleInfo.label}
        </Badge>
      </div>

      {/* Overview */}
      <Card className="border-border bg-card/40 rounded-lg">
        <CardContent className="p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {structure.overview}
          </p>
        </CardContent>
      </Card>

      {/* Tech Stack Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          Rekomendasi Tech Stack
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            Object.entries(structure.techStack) as [string, string | string[]][]
          )
            .filter(([key]) => key !== "extras")
            .map(([key, value]) => {
              const Icon = STACK_ICONS[key] || Code2;
              return (
                <Card
                  key={key}
                  className="border-border bg-[#0A0A0A] hover:border-primary/20 transition-all rounded-lg"
                >
                  <CardContent className="flex items-start gap-3.5 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {STACK_LABELS[key] || key}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {value as string}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Extras */}
        {structure.techStack.extras && structure.techStack.extras.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1.5">
            {structure.techStack.extras.map((extra, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-[#0A0A0A] border-border text-xs text-muted-foreground font-normal py-1 px-3 rounded-full"
              >
                <Puzzle className="mr-1.5 h-3.5 w-3.5 text-amber-400 inline" />
                {extra}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Core Features */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fitur Utama (Core Features)
        </h3>
        <div className="grid gap-2.5">
          {structure.coreFeatures.map((feature, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border border-border bg-[#0A0A0A] p-4 hover:border-emerald-500/20 transition-all stagger-${Math.min(i + 1, 5)} animate-fade-in`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                {i + 1}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <Card className="border-border bg-card/40 rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Gambaran Umum Arsitektur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {structure.architecture}
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 border-border text-muted-foreground hover:text-foreground rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading}
            className="gap-2 border-border text-muted-foreground hover:text-foreground rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Buat Ulang
          </Button>
          <Button
            onClick={onApprove}
            disabled={isLoading}
            size="lg"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Membuat PRD...
              </>
            ) : (
              <>
                Setujui & Buat PRD
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
