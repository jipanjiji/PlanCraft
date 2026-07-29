// ============================================================
// PlanCraft AI — Login Page (Indonesian)
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-background overflow-hidden">
      {/* Background Ambient Effects (emerald-tinted, not AI-purple) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.08) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-md px-4 animate-fade-in-scale">
        <Card className="border-border bg-card/90 backdrop-blur-xl rounded-xl shadow-lg">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                PlanCraft AI
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ubah ide mentah menjadi PRD yang siap didevelop
              </p>
            </div>

            {/* Features List */}
            <div className="mb-8 space-y-3.5">
              {[
                "Klarifikasi & penentuan ruang lingkup dengan AI",
                "Pembuatan dokumen PRD otomatis",
                "Pembagian daftar tugas per fase pengembangan",
                "Ekspor Markdown sekali klik untuk asisten coding AI",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="stagger-item flex items-center gap-3"
                  style={{ "--stagger": i } as React.CSSProperties}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-normal">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Google Sign In Button */}
            <Button
              onClick={signIn}
              disabled={loading}
              size="lg"
              className="w-full gap-3 bg-white text-zinc-900 hover:bg-zinc-100 font-medium h-12 rounded-lg active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-700" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Masuk dengan Google
            </Button>

            <p className="mt-4 text-center text-[10px] text-muted-foreground leading-normal">
              Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
            </p>
          </CardContent>
        </Card>

        {/* Bottom Tagline */}
        <p className="mt-6 text-center text-xs text-muted-foreground/50">
          Dibuat untuk solo developer, PM, dan developer yang menggunakan asisten coding AI (Cursor, Claude, ChatGPT)
        </p>
      </div>
    </div>
  );
}
