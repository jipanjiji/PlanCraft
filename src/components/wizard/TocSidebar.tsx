"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils/helpers";

interface HeadingItem {
  text: string;
  level: number;
  id: string;
}

interface TocSidebarProps {
  markdown: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}

// Recursively extracts plain text from MD AST children representation
function cleanMarkdownText(text: string): string {
  return text
    .replace(/[*_`]/g, "") // remove formatting marks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // convert markdown links to text
}

export function TocSidebar({ markdown, containerRef }: TocSidebarProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Parse headings from markdown
  useEffect(() => {
    if (!markdown) {
      setHeadings([]);
      return;
    }

    const lines = markdown.split("\n");
    const parsedHeadings: HeadingItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = cleanMarkdownText(match[2].trim());
        if (text) {
          parsedHeadings.push({
            text,
            level,
            id: slugify(text),
          });
        }
      }
    });

    setHeadings(parsedHeadings);
    if (parsedHeadings.length > 0) {
      setActiveId(parsedHeadings[0].id);
    }
  }, [markdown]);

  // Track active heading in viewport via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    // Disconnect old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerOptions = {
      root: containerRef?.current || null,
      rootMargin: "0px 0px -60% 0px", // triggers when heading is in top half
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    observerRef.current = observer;

    // Observe each heading element
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings, containerRef]);

  const handleHeadingClick = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      // If we have a scrollable container wrapper, we scroll inside it
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="w-56 shrink-0 border-r border-border/60 pr-4 hidden md:block select-none overflow-y-auto max-h-[500px]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Daftar Isi PRD
      </p>
      <ul className="space-y-1.5">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li
              key={heading.id}
              className={cn(
                "transition-all duration-200",
                heading.level === 1 ? "pl-0" : "",
                heading.level === 2 ? "pl-3" : "",
                heading.level === 3 ? "pl-5" : "",
                heading.level > 3 ? "pl-7" : ""
              )}
            >
              <button
                type="button"
                onClick={() => handleHeadingClick(heading.id)}
                className={cn(
                  "w-full text-left text-xs font-medium py-1 transition-colors leading-relaxed active:scale-[0.99] cursor-pointer",
                  isActive
                    ? "text-primary font-semibold border-l-2 border-primary pl-2"
                    : "text-muted-foreground hover:text-foreground hover:pl-1 pl-[2px]"
                )}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Recursive helper to extract text string from React Markdown children node
export function getFlattenedText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getFlattenedText).join("");
  }
  if (React.isValidElement(children) && children.props && 'children' in children.props) {
    return getFlattenedText(children.props.children);
  }
  return "";
}

// ReactMarkdown headings rendering components helper
export const mdHeadingComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = getFlattenedText(children);
    return <h1 id={slugify(text)} {...props}>{children}</h1>;
  },
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = getFlattenedText(children);
    return <h2 id={slugify(text)} {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = getFlattenedText(children);
    return <h3 id={slugify(text)} {...props}>{children}</h3>;
  },
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = getFlattenedText(children);
    return <h4 id={slugify(text)} {...props}>{children}</h4>;
  },
};
