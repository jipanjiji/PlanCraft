// ============================================================
// PlanCraft AI — Custom Confirmation Dialog Component
// Replaces standard browser confirm() with premium styled UI modals
// ============================================================

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "primary" | "destructive" | "success" | "warning";
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  variant = "primary",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-popover rounded-xl" showCloseButton={false}>
        <DialogHeader className="space-y-2.5">
          <DialogTitle className="text-base font-bold text-foreground leading-snug">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-border text-muted-foreground hover:text-foreground text-xs rounded-lg px-4 h-9 active:scale-[0.98] sm:flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "text-xs font-semibold rounded-lg px-4 h-9 active:scale-[0.98] sm:flex-1",
              variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
              variant === "destructive" && "bg-rose-600 text-white hover:bg-rose-700",
              variant === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
              variant === "warning" && "bg-amber-600 text-white hover:bg-amber-700"
            )}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
