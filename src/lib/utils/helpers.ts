// ============================================================
// PlanCraft AI — Miscellaneous Helpers
// ============================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "…";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  draft: {
    label: "Draf",
    color: "text-zinc-400",
    bgColor: "bg-zinc-400/10",
  },
  clarifying: {
    label: "Klarifikasi",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  structured: {
    label: "Terstruktur",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  prd_generated: {
    label: "PRD Siap",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  completed: {
    label: "Selesai",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
};
