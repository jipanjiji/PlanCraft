// ============================================================
// PlanCraft AI — Header Bar (Indonesian)
// Includes mobile hamburger menu for sidebar toggle
// ============================================================

"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-xl">
      {/* Left: Mobile hamburger + greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98] md:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground hidden md:inline">
          Selamat datang kembali,
        </span>
        <span className="text-sm font-medium text-foreground">
          {user?.displayName || "User"}
        </span>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage
                src={user?.photoURL}
                alt={user?.displayName || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-popover border-border"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">
                {user?.displayName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar akun
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
