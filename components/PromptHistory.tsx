"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { clsx } from "clsx";
import type { PromptHistoryEntry } from "@/lib/types";

interface PromptHistoryProps {
  history: PromptHistoryEntry[];
  onSelect: (entry: PromptHistoryEntry) => void;
  onClear: () => void;
  accentColor?: string;
}

export function PromptHistory({
  history,
  onSelect,
  onClear,
  accentColor = "#8B5CF6",
}: PromptHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-3 bg-surface hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted" />
          <span className="section-label">Prompt History</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-xs text-muted hover:text-secondary flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </button>

      {/* History entries */}
      {expanded && (
        <div className="divide-y divide-border animate-fade-in max-h-96 overflow-y-auto">
          {[...history].reverse().map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="w-full text-left px-5 py-4 hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Param tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: `${accentColor}20`,
                        color: accentColor,
                      }}
                    >
                      {entry.params.genre}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-muted">
                      {entry.params.mood}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-muted">
                      {entry.params.sunoMode ? "SUNO" : "AGNOSTIC"}
                    </span>
                  </div>
                  {/* Prompt preview */}
                  <p className="text-xs text-secondary font-mono line-clamp-2 leading-relaxed">
                    {entry.prompt}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted font-mono">{formatTime(entry.timestamp)}</span>
                  <span
                    className={clsx(
                      "text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity",
                    )}
                    style={{ color: accentColor }}
                  >
                    Load →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
