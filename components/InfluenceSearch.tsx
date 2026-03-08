"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { INFLUENCES } from "@/lib/knowledge-base";
import type { Influence } from "@/lib/types";

interface InfluenceSearchProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  genreId?: string;
  accentColor?: string;
  max?: number;
}

function matchesQuery(inf: Influence, query: string): boolean {
  const q = query.toLowerCase();
  return (
    inf.label.toLowerCase().includes(q) ||
    inf.sonic.toLowerCase().includes(q) ||
    inf.genres.some((g) => g.includes(q)) ||
    (inf.searchTerms?.some((t) => t.toLowerCase().includes(q)) ?? false)
  );
}

export function InfluenceSearch({
  selectedIds,
  onToggle,
  genreId,
  accentColor = "#8B5CF6",
  max = 5,
}: InfluenceSearchProps) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    return [...INFLUENCES].sort((a, b) => {
      const aMatch = genreId && a.genres.includes(genreId) ? -1 : 1;
      const bMatch = genreId && b.genres.includes(genreId) ? -1 : 1;
      return aMatch - bMatch;
    });
  }, [genreId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    return sorted.filter((inf) => matchesQuery(inf, query));
  }, [sorted, query]);

  const isSelected = (id: string) => selectedIds.includes(id);
  const isDisabled = (id: string) => selectedIds.length >= max && !isSelected(id);
  const recommended = genreId ? sorted.filter((i) => i.genres.includes(genreId)) : [];

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search influences by name, style, or sound..."
          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm bg-surface border border-border focus:border-border-strong focus:outline-none text-primary placeholder:text-muted transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim() ? (
        /* Search results */
        <div className="flex flex-wrap gap-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted py-1">No matches for &ldquo;{query}&rdquo;</p>
          ) : (
            filtered.map((inf) => {
              const active = isSelected(inf.id);
              const disabled = isDisabled(inf.id);
              return (
                <InfluenceChip
                  key={inf.id}
                  inf={inf}
                  active={active}
                  disabled={disabled}
                  isMatch={genreId ? inf.genres.includes(genreId) : false}
                  accentColor={accentColor}
                  onToggle={() => onToggle(inf.id)}
                />
              );
            })
          )}
        </div>
      ) : (
        /* Default: recommended first, then all */
        <div className="space-y-4">
          {genreId && recommended.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">
                <span style={{ color: accentColor }}>★</span> Recommended
              </p>
              <div className="flex flex-wrap gap-2">
                {recommended.map((inf) => (
                  <InfluenceChip
                    key={inf.id}
                    inf={inf}
                    active={isSelected(inf.id)}
                    disabled={isDisabled(inf.id)}
                    isMatch
                    accentColor={accentColor}
                    onToggle={() => onToggle(inf.id)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            {genreId && recommended.length > 0 && (
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">All influences</p>
            )}
            <div className="flex flex-wrap gap-2">
              {sorted.map((inf) => (
                <InfluenceChip
                  key={inf.id}
                  inf={inf}
                  active={isSelected(inf.id)}
                  disabled={isDisabled(inf.id)}
                  isMatch={genreId ? inf.genres.includes(genreId) : false}
                  accentColor={accentColor}
                  onToggle={() => onToggle(inf.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfluenceChip({
  inf,
  active,
  disabled,
  isMatch,
  accentColor,
  onToggle,
}: {
  inf: Influence;
  active: boolean;
  disabled: boolean;
  isMatch: boolean;
  accentColor: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={() => !disabled && onToggle()}
      disabled={disabled}
      title={inf.sonic}
      className="relative px-3 py-1.5 rounded-full text-sm transition-all duration-150 border focus:outline-none"
      style={
        active
          ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor, opacity: 1 }
          : disabled
          ? { borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#707080", opacity: 0.4, cursor: "not-allowed" }
          : {
              borderColor: isMatch ? `${accentColor}40` : "rgba(255,255,255,0.08)",
              background: isMatch ? `${accentColor}08` : "rgba(255,255,255,0.03)",
              color: isMatch ? "#EAEAF0" : "#A8A8BC",
            }
      }
    >
      {isMatch && !active && <span className="mr-1" style={{ color: accentColor }}>★</span>}
      {inf.label}
    </button>
  );
}
