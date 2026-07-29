// ============================================================
// PlanCraft AI — Step 2: Clarifying Questions (Indonesian)
// ============================================================

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, MessageCircleQuestion, Plus, Check } from "lucide-react";
import type { ClarifyingQA, ClarifyingQuestion } from "@/lib/types";

interface QuestionsStepProps {
  questions: ClarifyingQuestion[];
  initialAnswers?: ClarifyingQA[];
  onSubmit: (answers: ClarifyingQA[]) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function QuestionsStep({
  questions,
  initialAnswers = [],
  onSubmit,
  onBack,
  isLoading,
}: QuestionsStepProps) {
  // Initialize state based on initialAnswers or empty
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>(() => {
    const initial: Record<number, string[]> = {};
    questions.forEach((q, idx) => {
      const prevAnswer = initialAnswers.find((a) => a.question === q.question)?.answer || "";
      if (prevAnswer) {
        // Try to match options
        const selected = q.options.filter((opt) => prevAnswer.includes(opt));
        initial[idx] = selected;
      } else {
        initial[idx] = [];
      }
    });
    return initial;
  });

  const [customAnswers, setCustomAnswers] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    questions.forEach((q, idx) => {
      const prevAnswer = initialAnswers.find((a) => a.question === q.question)?.answer || "";
      if (prevAnswer) {
        const selected = q.options.filter((opt) => prevAnswer.includes(opt));
        const hasCustom = prevAnswer && selected.length === 0;
        initial[idx] = hasCustom ? prevAnswer : "";
      } else {
        initial[idx] = "";
      }
    });
    return initial;
  });

  const [showCustomInput, setShowCustomInput] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    questions.forEach((q, idx) => {
      const prevAnswer = initialAnswers.find((a) => a.question === q.question)?.answer || "";
      if (prevAnswer) {
        const selected = q.options.filter((opt) => prevAnswer.includes(opt));
        initial[idx] = !!prevAnswer && selected.length === 0;
      } else {
        initial[idx] = false;
      }
    });
    return initial;
  });

  const handleOptionToggle = (qIdx: number, option: string) => {
    setSelectedOptions((prev) => {
      const current = prev[qIdx] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [qIdx]: updated };
    });
  };

  const getCompiledAnswer = (qIdx: number): string => {
    const selected = selectedOptions[qIdx] || [];
    const custom = customAnswers[qIdx] || "";
    const showCustom = showCustomInput[qIdx];

    const parts = [...selected];
    if (showCustom && custom.trim()) {
      parts.push(custom.trim());
    }

    return parts.join(", ");
  };

  const allAnswered = questions.every((_, idx) => {
    return getCompiledAnswer(idx).length > 0;
  });

  const handleSubmit = () => {
    if (!allAnswered) return;
    const qa: ClarifyingQA[] = questions.map((q, idx) => ({
      question: q.question,
      answer: getCompiledAnswer(idx),
    }));
    onSubmit(qa);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <MessageCircleQuestion className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Mari perjelas visi Anda
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Pilih satu atau beberapa jawaban ganda di bawah ini, atau tulis jawaban kustom Anda sendiri.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, index) => {
          const selected = selectedOptions[index] || [];
          const showCustom = showCustomInput[index];

          return (
            <Card
              key={index}
              className="border-border bg-card/35 hover:border-zinc-700 transition-all duration-200 rounded-xl overflow-hidden stagger-item"
              style={{ "--stagger": index } as React.CSSProperties}
            >
              <CardContent className="p-6 space-y-5">
                {/* Question Text */}
                <div className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-base font-semibold text-foreground leading-relaxed pt-0.5">
                    {q.question}
                  </p>
                </div>

                {/* Multiple Choice Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {q.options &&
                    q.options.map((option, optIdx) => {
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleOptionToggle(index, option)}
                          className={cn(
                            "group px-5 py-4 text-sm font-medium text-left rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 outline-none select-none active:scale-[0.98]",
                            isSelected
                              ? "bg-primary/5 border-primary text-primary"
                              : "bg-secondary/50 border-border text-muted-foreground hover:border-zinc-600 hover:text-foreground"
                          )}
                        >
                          <span className="leading-relaxed">{option}</span>
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-zinc-700 group-hover:border-zinc-500"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Add Custom Button Option */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput((prev) => ({ ...prev, [index]: !showCustom }));
                    }}
                    className={cn(
                      "w-full px-5 py-3 text-xs font-semibold rounded-xl border border-dashed transition-all duration-200 flex items-center justify-center gap-2 outline-none select-none active:scale-[0.98]",
                      showCustom
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-zinc-800 hover:border-amber-500/40 hover:bg-amber-500/5 text-muted-foreground hover:text-amber-400"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Tulis Jawaban Kustom Anda Sendiri
                  </button>
                </div>

                {/* Custom Answer Textarea */}
                {showCustom && (
                  <div className="pt-1">
                    <Textarea
                      placeholder="Masukkan jawaban spesifik Anda di sini..."
                      value={customAnswers[index] || ""}
                      onChange={(e) => {
                        setCustomAnswers((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }));
                      }}
                      className="min-h-[90px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-amber-500 rounded-xl leading-relaxed p-4"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
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
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || isLoading}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyusun Struktur...
            </>
          ) : (
            <>
              Lanjutkan
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
