"use client";

import { useState, useMemo } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { INFLUENCES } from "@/lib/knowledge-base";
import { Chip, Waveform } from "./ui";
import type { Influence } from "@/lib/types";

interface InfluenceSearchProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  genreId?: string;
  max?: number;
  /** Artists the user added on the fly — persisted across visits. */
  customInfluences: Influence[];
  onAddCustom: (name: string) => Promise<boolean>;
  onRemoveCustom: (id: string) => void;
  addingCustom: boolean;
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
  max = 5,
  customInfluences,
  onAddCustom,
  onRemoveCustom,
  addingCustom,
}: InfluenceSearchProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const all = useMemo(() => [...customInfluences, ...INFLUENCES], [customInfluences]);

  const sorted = useMemo(() => {
    return [...all].sort((a, b) => {
      const aMatch = genreId && a.genres.includes(genreId) ? -1 : 1;
      const bMatch = genreId && b.genres.includes(genreId) ? -1 : 1;
      return aMatch - bMatch;
    });
  }, [all, genreId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    return sorted.filter((inf) => matchesQuery(inf, query));
  }, [sorted, query]);

  const isSelected = (id: string) => selectedIds.includes(id);
  const atMax = selectedIds.length >= max;
  const isDisabled = (id: string) => atMax && !isSelected(id);
  const recommended = useMemo(
    () => (genreId ? sorted.filter((i) => i.genres.includes(genreId) && !i.custom) : []),
    [sorted, genreId]
  );
  const catalog = useMemo(() => sorted.filter((i) => !i.custom), [sorted]);
  const selectedCatalog = useMemo(() => catalog.filter((i) => selectedIds.includes(i.id)), [catalog, selectedIds]);

  const trimmed = query.trim();
  const exactMatch = all.some((i) => i.label.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed.length >= 2 && !exactMatch && !addingCustom && !atMax;

  async function handleAdd() {
    if (!canAdd) return;
    const ok = await onAddCustom(trimmed);
    if (ok) setQuery("");
  }

  const chip = (inf: Influence) => (
    <Chip
      key={inf.id}
      label={inf.label}
      active={isSelected(inf.id)}
      disabled={isDisabled(inf.id)}
      onClick={() => onToggle(inf.id)}
      tone="accent2"
      title={inf.sonic}
      dashed={inf.custom}
      onRemove={inf.custom ? () => onRemoveCustom(inf.id) : undefined}
      removeLabel={inf.custom ? `Remove ${inf.label}` : undefined}
    />
  );

  // Without a query: customs, then genre recommendations (plus anything selected), with the rest behind "Show all"
  const shortlist = useMemo(() => {
    const seen = new Set<string>();
    const out: Influence[] = [];
    for (const inf of [...recommended, ...selectedCatalog]) {
      if (!seen.has(inf.id)) {
        seen.add(inf.id);
        out.push(inf);
      }
    }
    return out;
  }, [recommended, selectedCatalog]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAdd && filtered.length === 0) {
              e.preventDefault();
              void handleAdd();
            }
          }}
          placeholder="Search, or type any artist to add them"
          className="field field-sm !pl-10 !pr-9"
          aria-label="Search influences"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-secondary hover:text-primary"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {trimmed ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {filtered.map(chip)}
            {(canAdd || addingCustom) && (
              <button
                type="button"
                onClick={() => void handleAdd()}
                disabled={!canAdd}
                title="Claude writes a sonic profile for this artist — their sound, never their name, reaches the prompt"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-[13px] font-medium border border-dashed transition-colors disabled:cursor-not-allowed"
                style={{ borderColor: "var(--accent2)", color: "var(--accent2)", background: "rgba(255,255,255,0.03)" }}
              >
                {addingCustom ? <Waveform bars={3} height={11} /> : <Sparkles className="w-3.5 h-3.5" />}
                {addingCustom ? `Profiling “${trimmed}”…` : `Add “${trimmed}”`}
              </button>
            )}
          </div>
          {filtered.length === 0 && !canAdd && !addingCustom && (
            <p className="text-[12px] text-secondary">
              {atMax ? `You've picked ${max} already — remove one to add “${trimmed}”.` : `No matches for “${trimmed}”.`}
            </p>
          )}
          {filtered.length === 0 && canAdd && (
            <p className="text-[12px] text-secondary">Not in the catalog — add it and Claude will describe the sound.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {customInfluences.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-secondary">Your additions</span>
              <div className="flex flex-wrap gap-2">{customInfluences.map(chip)}</div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            {genreId && recommended.length > 0 && !showAll && (
              <span className="text-[11px] text-secondary">Recommended for this genre</span>
            )}
            <div className="flex flex-wrap gap-2">
              {(showAll || !genreId || recommended.length === 0 ? catalog : shortlist).map(chip)}
            </div>
            {genreId && recommended.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="self-start text-[12px] text-secondary hover:text-primary transition-colors"
              >
                {showAll ? "Show recommended only" : `Show all ${catalog.length} influences`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
