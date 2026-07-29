// ============================================================
// PlanCraft AI — Sidebar Navigation (Indonesian)
// Responsive: hidden on mobile, toggled via Header hamburger
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dasbor Proyek",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Buat Proyek Baru",
    href: "/project/new",
    icon: Plus,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-[100dvh] flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          // Desktop: always visible
          "max-md:translate-x-[-100%]",
          collapsed ? "md:w-[68px]" : "md:w-[240px]",
          // Mobile: slide in/out
          mobileOpen && "max-md:translate-x-0 max-md:w-[280px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div>
                <h1 className="text-sm font-semibold text-foreground">PlanCraft</h1>
                <p className="text-[10px] text-muted-foreground">Generator PRD AI</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span>{item.label}</span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle (desktop only) */}
        <div className="hidden border-t border-border p-3 md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Sembunyikan</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
