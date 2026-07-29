// ============================================================
// PlanCraft AI — Landing / Root Page (redirects to login or dashboard)
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
