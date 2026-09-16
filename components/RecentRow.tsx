"use client";

import type { PromptHistoryEntry } from "@/lib/types";

interface RecentRowProps {
  history: PromptHistoryEntry[];
  activeId?: string;
  onSelect: (entry: PromptHistoryEntry) => void;
  onClear: () => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Horizontal row of 220px cards — genre in accent-2, timestamp in secondary, two-line preview. */
export function RecentRow({ history, activeId, onSelect, onClear }: RecentRowProps) {
  if (history.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5" id="history">
      <div className="flex items-center justify-between">
        <span className="label">Recent</span>
        <button type="button" onClick={onClear} className="text-[12px] text-secondary hover:text-primary transition-colors">
          Clear
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[...history].reverse().map((entry) => {
          const active = entry.id === activeId;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry)}
              aria-pressed={active}
              className="text-left flex-none w-[220px] rounded-item bg-panel p-3.5 flex flex-col gap-2 border transition-colors"
              style={{ borderColor: active ? "var(--accent2)" : "rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold truncate" style={{ color: "var(--accent2)" }}>{entry.params.genre}</span>
                <span className="text-[11px] text-secondary shrink-0">{relativeTime(entry.timestamp)}</span>
              </div>
              <div className="clamp2 text-[12px] text-secondary leading-relaxed">{entry.prompt}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
