// ============================================================
// PlanCraft AI — Dashboard Project Card
// ============================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  ExternalLink,
  Copy,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
import { formatRelativeTime, STATUS_CONFIG, truncateText } from "@/lib/utils/helpers";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onDuplicate: (project: Project) => void;
  onDelete: (id: string) => void;
  onDownload: (project: Project) => void;
}

export function ProjectCard({
  project,
  onOpen,
  onDuplicate,
  onDelete,
  onDownload,
}: ProjectCardProps) {
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;

  return (
    <Card
      className="group cursor-pointer border-border bg-card/50 transition-all duration-200 hover:border-primary/20 hover:bg-card glow-border"
      onClick={() => onOpen(project.id)}
    >
      <CardContent className="p-5">
        {/* Top Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                {project.title || "Untitled Project"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(project.updatedAt)}
              </p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted cursor-pointer"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#121212] border-border"
              >
                <DropdownMenuItem
                  onClick={() => onOpen(project.id)}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka Proyek
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate(project)}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplikat
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDownload(project)}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh .md
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Proyek
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
          {truncateText(project.rawIdea || "Tidak ada deskripsi", 120)}
        </p>

        {/* Bottom Row */}
        <div className="mt-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-[10px] font-medium ${statusConfig.color} ${statusConfig.bgColor} border-transparent`}
          >
            {statusConfig.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {project.tasks.length > 0
              ? `${project.tasks.length} tugas`
              : "Belum ada tugas"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
