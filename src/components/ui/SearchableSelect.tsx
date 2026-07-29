// ============================================================
// PlanCraft AI — SearchableSelect Dropdown Component
// Search-capable dropdown that allows selecting or typing custom input
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih atau cari...",
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with value changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If query was modified but not selected, commit the search query as custom input
        if (searchQuery !== value) {
          onChange(searchQuery);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery, value, onChange]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchQuery(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val); // Propagate text edits immediately to parent
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary rounded-lg h-10 w-full"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-lg focus:outline-none animate-fade-in-scale max-h-60 overflow-hidden flex flex-col">
          {/* Search indicator */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-secondary/30">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
              {filteredOptions.length > 0 ? "Pilihan yang Cocok" : "Ketik untuk opsi kustom"}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer",
                    value === option ? "text-primary bg-primary/5 font-semibold" : "text-foreground"
                  )}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                Gunakan &ldquo;{searchQuery}&rdquo; sebagai kustom
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
