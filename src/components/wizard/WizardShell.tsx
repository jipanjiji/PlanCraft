// ============================================================
// PlanCraft AI — Wizard Shell (Step Container + Progress Bar)
// Responsive: horizontal scroll-snap on mobile
// ============================================================

"use client";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStep } from "@/lib/types";
import { Check } from "lucide-react";

interface WizardShellProps {
  currentStep: WizardStep;
  children: React.ReactNode;
}

const stepIndexMap: Record<WizardStep, number> = {
  idea: 0,
  questions: 1,
  structure: 2,
  prd: 3,
  tasks: 4,
  export: 5,
};

export function WizardShell({ currentStep, children }: WizardShellProps) {
  const currentIndex = stepIndexMap[currentStep];

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Progress Bar */}
      <div className="mb-8 px-2 md:px-4">
        {/* Mobile: compact step indicator */}
        <div className="flex items-center justify-center gap-2 md:hidden mb-2">
          <span className="text-xs font-medium text-primary">
            {WIZARD_STEPS[currentIndex]?.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {WIZARD_STEPS.length}
          </span>
        </div>
        {/* Mobile: progress dots */}
        <div className="flex items-center justify-center gap-1.5 md:hidden">
          {WIZARD_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index < currentIndex
                  ? "w-6 bg-primary"
                  : index === currentIndex
                  ? "w-6 bg-primary/60"
                  : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>

        {/* Desktop: full step circles */}
        <div className="hidden md:flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={step.key} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
                      isUpcoming &&
                        "border-border bg-transparent text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium transition-colors",
                      isCurrent && "text-primary",
                      isCompleted && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-[2px] flex-1 transition-all duration-500 sm:w-12 md:w-16",
                      index < currentIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div>{children}</div>
    </div>
  );
}
