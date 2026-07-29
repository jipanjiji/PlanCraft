// ============================================================
// PlanCraft AI — Step 3: Structure Review (Indonesian & Editable)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
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
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import type { SystemStructure } from "@/lib/types";

interface StructureStepProps {
  structure: SystemStructure;
  onApprove: (updatedStructure: SystemStructure) => void;
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

// Default lists of choices for SearchableSelect
const FRONTEND_OPTIONS = ["Next.js", "React (Vite)", "Vue.js", "Nuxt.js", "Svelte", "SvelteKit", "Angular", "SolidJS", "HTML/CSS/JS (Vanilla)"];
const BACKEND_OPTIONS = ["Node.js (Express)", "Node.js (NestJS)", "Python (FastAPI)", "Python (Django)", "Python (Flask)", "Go (Gin)", "Ruby on Rails", "PHP (Laravel)", "Java (Spring Boot)", "Serverless Functions"];
const DATABASE_OPTIONS = ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Firebase Firestore", "Supabase (PostgreSQL)", "DynamoDB", "Cassandra"];
const DEPLOYMENT_OPTIONS = ["Vercel", "Netlify", "Railway", "Render", "AWS", "Google Cloud Platform (GCP)", "Microsoft Azure", "Docker (Self-hosted)", "Heroku"];
const EXTRAS_OPTIONS = ["Tailwind CSS", "shadcn/ui", "Redux", "Zustand", "React Query", "Prisma", "Drizzle ORM", "Stripe", "Auth0", "Firebase Auth", "Resend"];

export function StructureStep({
  structure,
  onApprove,
  onRegenerate,
  onBack,
  isLoading,
}: StructureStepProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Local state representing the edited structure
  const [scale, setScale] = useState(structure.scale);
  const [overview, setOverview] = useState(structure.overview);
  const [frontend, setFrontend] = useState(structure.techStack.frontend);
  const [backend, setBackend] = useState(structure.techStack.backend);
  const [database, setDatabase] = useState(structure.techStack.database);
  const [deployment, setDeployment] = useState(structure.techStack.deployment);
  const [extras, setExtras] = useState<string[]>(structure.techStack.extras || []);
  const [coreFeatures, setCoreFeatures] = useState<string[]>(structure.coreFeatures || []);
  const [architecture, setArchitecture] = useState(structure.architecture);

  // Sync state if structure prop changes (e.g. on regenerate)
  useEffect(() => {
    setScale(structure.scale);
    setOverview(structure.overview);
    setFrontend(structure.techStack.frontend);
    setBackend(structure.techStack.backend);
    setDatabase(structure.techStack.database);
    setDeployment(structure.techStack.deployment);
    setExtras(structure.techStack.extras || []);
    setCoreFeatures(structure.coreFeatures || []);
    setArchitecture(structure.architecture);
  }, [structure]);

  // Temp state for adding a new extra item
  const [newExtra, setNewExtra] = useState("");

  const handleAddExtra = () => {
    if (newExtra.trim() && !extras.includes(newExtra.trim())) {
      setExtras([...extras, newExtra.trim()]);
      setNewExtra("");
    }
  };

  const handleRemoveExtra = (idx: number) => {
    setExtras(extras.filter((_, i) => i !== idx));
  };

  const handleAddFeature = () => {
    setCoreFeatures([...coreFeatures, ""]);
  };

  const handleFeatureChange = (idx: number, val: string) => {
    const updated = [...coreFeatures];
    updated[idx] = val;
    setCoreFeatures(updated);
  };

  const handleRemoveFeature = (idx: number) => {
    setCoreFeatures(coreFeatures.filter((_, i) => i !== idx));
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
  };

  const handleCancelEdits = () => {
    // Reset to prop values
    setScale(structure.scale);
    setOverview(structure.overview);
    setFrontend(structure.techStack.frontend);
    setBackend(structure.techStack.backend);
    setDatabase(structure.techStack.database);
    setDeployment(structure.techStack.deployment);
    setExtras(structure.techStack.extras || []);
    setCoreFeatures(structure.coreFeatures || []);
    setArchitecture(structure.architecture);
    setIsEditing(false);
  };

  const handleApproveAction = () => {
    const compiledStructure: SystemStructure = {
      scale,
      overview,
      coreFeatures: coreFeatures.filter((f) => f.trim().length > 0),
      techStack: {
        frontend,
        backend,
        database,
        deployment,
        extras: extras.filter((e) => e.trim().length > 0),
      },
      architecture,
    };
    onApprove(compiledStructure);
  };

  const scaleInfo = SCALE_LABELS[scale] || SCALE_LABELS.medium;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center relative">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
          <Layers className="h-7 w-7 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          {isEditing ? "Edit Struktur Sistem" : "Usulan Struktur Sistem"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {isEditing
            ? "Sesuaikan arsitektur, tech stack, dan daftar fitur sesuai preferensi Anda sebelum PRD dibuat."
            : "Tinjau arsitektur dan tech stack yang direkomendasikan untuk proyek Anda sebelum membuat PRD lengkap."}
        </p>

        {/* Edit mode toggle button */}
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="absolute right-0 top-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border hover:bg-muted rounded-lg active:scale-[0.98]"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Struktur
          </Button>
        )}
      </div>

      {isEditing ? (
        /* ==================== EDIT MODE FORM ==================== */
        <div className="space-y-6 animate-fade-in-scale">
          {/* Scale Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Skala Sistem</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full h-10 px-3 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="small">Skala Kecil</option>
              <option value="medium">Skala Menengah</option>
              <option value="large">Skala Besar</option>
              <option value="enterprise">Skala Enterprise</option>
            </select>
          </div>

          {/* Overview Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Deskripsi Umum</label>
            <Textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Masukkan gambaran umum sistem..."
              className="min-h-[100px] bg-card border-border text-foreground rounded-lg"
            />
          </div>

          {/* Tech Stack Form Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              Sesuaikan Tech Stack
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Frontend */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Frontend</span>
                <SearchableSelect
                  value={frontend}
                  onChange={setFrontend}
                  options={FRONTEND_OPTIONS}
                  placeholder="Pilih atau ketik frontend..."
                />
              </div>

              {/* Backend */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Backend</span>
                <SearchableSelect
                  value={backend}
                  onChange={setBackend}
                  options={BACKEND_OPTIONS}
                  placeholder="Pilih atau ketik backend..."
                />
              </div>

              {/* Database */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Database</span>
                <SearchableSelect
                  value={database}
                  onChange={setDatabase}
                  options={DATABASE_OPTIONS}
                  placeholder="Pilih atau ketik database..."
                />
              </div>

              {/* Deployment */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deployment</span>
                <SearchableSelect
                  value={deployment}
                  onChange={setDeployment}
                  options={DEPLOYMENT_OPTIONS}
                  placeholder="Pilih atau ketik deployment..."
                />
              </div>
            </div>
          </div>

          {/* Extras Edit Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Tambahan (Extras)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {extras.map((extra, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-secondary/50 border-border text-xs text-muted-foreground font-normal py-1 pl-3 pr-1.5 rounded-full flex items-center gap-1"
                >
                  {extra}
                  <button
                    type="button"
                    onClick={() => handleRemoveExtra(idx)}
                    className="hover:text-destructive text-muted-foreground transition-colors p-0.5 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <SearchableSelect
                value={newExtra}
                onChange={setNewExtra}
                options={EXTRAS_OPTIONS}
                placeholder="Cari atau ketik library..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddExtra}
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border hover:bg-muted active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Core Features Edit Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground">Fitur Utama (Core Features)</label>
            <div className="space-y-2">
              {coreFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 animate-fade-in-scale">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder="Contoh: Otentikasi Pengguna, Integrasi Pembayaran..."
                    className="flex-1 bg-card border-border text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-border text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={handleAddFeature}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border hover:bg-muted rounded-lg active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Fitur
            </Button>
          </div>

          {/* Architecture Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Gambaran Arsitektur</label>
            <Textarea
              value={architecture}
              onChange={(e) => setArchitecture(e.target.value)}
              placeholder="Masukkan detail arsitektur..."
              className="min-h-[100px] bg-card border-border text-foreground rounded-lg"
            />
          </div>

          {/* Save / Cancel Controls */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
            <Button
              type="button"
              onClick={handleCancelEdits}
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdits}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg active:scale-[0.98]"
            >
              <Check className="h-4 w-4" />
              Simpan Perubahan
            </Button>
          </div>
        </div>
      ) : (
        /* ==================== REVIEW MODE VIEW ==================== */
        <div className="space-y-6 animate-fade-in-scale">
          {/* Scale Badge */}
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full ${scaleInfo.class}`}
            >
              {scaleInfo.label}
            </Badge>
          </div>

          {/* Overview */}
          <Card className="border-border bg-card/40 rounded-xl">
            <CardContent className="p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {overview || "*Belum ada deskripsi umum*"}
              </p>
            </CardContent>
          </Card>

          {/* Tech Stack Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              Rekomendasi Tech Stack
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "frontend", value: frontend },
                { key: "backend", value: backend },
                { key: "database", value: database },
                { key: "deployment", value: deployment },
              ].map(({ key, value }) => {
                const Icon = STACK_ICONS[key] || Code2;
                return (
                  <Card
                    key={key}
                    className="border-border bg-secondary/50 hover:border-primary/20 transition-all duration-200 rounded-xl"
                  >
                    <CardContent className="flex items-start gap-3.5 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {STACK_LABELS[key] || key}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {value || "*Belum ditentukan*"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Extras */}
            {extras.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {extras.map((extra, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-secondary/50 border-border text-xs text-muted-foreground font-normal py-1 px-3 rounded-full"
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
            <h3 className="text-xs font-medium text-muted-foreground">
              Fitur Utama (Core Features)
            </h3>
            <div className="grid gap-2.5">
              {coreFeatures.length > 0 ? (
                coreFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4 hover:border-emerald-500/20 transition-all duration-200 stagger-item"
                    style={{ "--stagger": i } as React.CSSProperties}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{feature}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">*Belum ada fitur utama yang ditambahkan*</p>
              )}
            </div>
          </div>

          {/* Architecture */}
          <Card className="border-border bg-card/40 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Gambaran Umum Arsitektur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {architecture || "*Belum ada gambaran arsitektur*"}
              </p>
            </CardContent>
          </Card>

          {/* Review Mode Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
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
                onClick={handleApproveAction}
                disabled={isLoading}
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98]"
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
      )}
    </div>
  );
}
