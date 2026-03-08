"use client";

import type { PromptLength } from "@/lib/types";

interface PromptLengthToggleProps {
  value: PromptLength;
  onChange: (v: PromptLength) => void;
  accentColor?: string;
}

const OPTIONS: { id: PromptLength; label: string; range: string }[] = [
  { id: "concise",  label: "Concise",  range: "40–70 words" },
  { id: "standard", label: "Standard", range: "70–120 words" },
  { id: "detailed", label: "Detailed", range: "120–180 words" },
];

export function PromptLengthToggle({ value, onChange, accentColor = "#8B5CF6" }: PromptLengthToggleProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="section-label shrink-0">Prompt Length</span>
      <div className="flex items-center rounded-xl border border-border p-0.5 bg-surface gap-0.5">
        {OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              title={opt.range}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none"
              style={
                active
                  ? { background: accentColor, color: "#141420", fontWeight: 700 }
                  : { color: "#78788C" }
              }
            >
              {opt.label}
              <span className="hidden sm:inline text-[10px] opacity-60 ml-1">({opt.range})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
