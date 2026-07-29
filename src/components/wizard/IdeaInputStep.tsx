// ============================================================
// PlanCraft AI — Step 1: Idea Input (Indonesian)
// ============================================================

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

const EXAMPLE_IDEAS = [
  "Aplikasi pelacak keuangan pribadi yang menggunakan AI untuk mengkategorikan transaksi secara otomatis dan memprediksi pola pengeluaran bulanan.",
  "Platform berbagi resep kolaboratif lengkap dengan fitur rencana makan (meal planning) mingguan dan daftar belanja otomatis.",
  "Alat SaaS yang mengubah desain mockup antarmuka pengguna menjadi kode HTML/CSS yang responsif menggunakan AI secara instan.",
  "Platform pembelajaran online interaktif dengan kuis adaptif dan fitur pengulangan berjeda (spaced repetition) untuk mempermudah menghafal.",
];

interface IdeaInputStepProps {
  initialIdea?: string;
  initialTitle?: string;
  onSubmit: (idea: string, title: string) => void;
  isLoading: boolean;
}

export function IdeaInputStep({
  initialIdea = "",
  initialTitle = "",
  onSubmit,
  isLoading,
}: IdeaInputStepProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [title, setTitle] = useState(initialTitle);

  const handleSubmit = () => {
    if (idea.trim().length < 10) return;
    onSubmit(idea.trim(), title.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Apa yang ingin Anda bangun?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Jelaskan ide produk Anda secara detail. Semakin banyak konteks yang Anda berikan, semakin baik kualitas PRD yang dihasilkan.
        </p>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Nama Proyek
        </label>
        <Input
          placeholder="Contoh: FinTrack AI, RecipeHub, CodeForge..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-primary"
        />
      </div>

      {/* Idea Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Detail Ide Produk
          </label>
          <span
            className={`text-xs font-mono ${
              idea.length > 4500
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {idea.length} / 5000
          </span>
        </div>
        <Textarea
          placeholder="Jelaskan ide produk Anda... Masalah apa yang diselesaikan? Siapa target penggunanya? Apa saja fitur utama yang harus ada?"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="min-h-[180px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-primary leading-relaxed"
          maxLength={5000}
        />
      </div>

      {/* Example Ideas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
          <Lightbulb className="h-3.5 w-3.5" />
          <span>Butuh inspirasi? Coba pilih salah satu contoh ide ini:</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXAMPLE_IDEAS.map((example, i) => (
            <Card
              key={i}
              className="cursor-pointer border-border bg-card/40 transition-all duration-200 hover:border-primary/30 hover:bg-card active:scale-[0.98] rounded-xl stagger-item"
              style={{ "--stagger": i } as React.CSSProperties}
              onClick={() => {
                setIdea(example);
                setTitle("");
              }}
            >
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {example}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={idea.trim().length < 10 || isLoading}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-lg active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menganalisis...
            </>
          ) : (
            <>
              Buat Pertanyaan Klarifikasi
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
