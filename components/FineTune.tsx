"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { TIME_SIGNATURES, CHORD_VOICINGS, VOICING_CATEGORIES, TEXTURE_CATEGORIES } from "@/lib/knowledge-base";
import { Chip } from "./ui";

interface FineTuneProps {
  selectedTimeSigs: string[];
  onTimeSigsChange: (sigs: string[]) => void;
  selectedChords: string[];
  onChordsChange: (ids: string[]) => void;
  selectedTextures: string[];
  onTexturesChange: (textures: string[]) => void;
}

/** Time signatures, chord colors, human textures — collapsed by default, count badge when in use. */
export function FineTune({
  selectedTimeSigs,
  onTimeSigsChange,
  selectedChords,
  onChordsChange,
  selectedTextures,
  onTexturesChange,
}: FineTuneProps) {
  const [open, setOpen] = useState(false);

  const activeCount =
    selectedTimeSigs.filter((s) => s !== "4-4").length + selectedChords.length + selectedTextures.length;

  function toggleTimeSig(id: string) {
    if (id === "4-4") {
      onTimeSigsChange(["4-4"]);
      return;
    }
    if (selectedTimeSigs.includes(id)) {
      const next = selectedTimeSigs.filter((s) => s !== id);
      onTimeSigsChange(next.length === 0 ? ["4-4"] : next);
    } else {
      onTimeSigsChange([...selectedTimeSigs.filter((s) => s !== "4-4"), id]);
    }
  }

  const toggleIn = (list: string[], set: (v: string[]) => void) => (id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="rounded-item border border-line bg-fill-quiet">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="label">Fine-tune</span>
          {activeCount > 0 && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-pill" style={{ background: "var(--accent2)", color: "#15130F" }}>
              {activeCount}
            </span>
          )}
          <span className="text-[12px] text-secondary">time signatures · chord color · textures</span>
        </span>
        <ChevronDown className={clsx("w-4 h-4 text-secondary transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-5 animate-fade-in border-t border-line pt-4">
          <div className="flex flex-col gap-2">
            <span className="label">Time signature</span>
            <p className="text-[12px] text-secondary -mt-1">Pick more than one to describe a song that shifts meter.</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SIGNATURES.map((sig) => (
                <Chip
                  key={sig.id}
                  label={<span className="font-mono">{sig.label}</span>}
                  active={selectedTimeSigs.includes(sig.id)}
                  onClick={() => toggleTimeSig(sig.id)}
                  tone="accent2"
                  title={sig.description}
                  size="sm"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label">Chord color</span>
            <div className="flex flex-col gap-2.5">
              {VOICING_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-secondary">{cat.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {CHORD_VOICINGS.filter((c) => c.category === cat.id).map((chord) => (
                      <Chip
                        key={chord.id}
                        label={chord.label}
                        active={selectedChords.includes(chord.id)}
                        onClick={() => toggleIn(selectedChords, onChordsChange)(chord.id)}
                        tone="accent2"
                        title={chord.description}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label">Human textures</span>
            <p className="text-[12px] text-secondary -mt-1">Little imperfections that make AI music sound real.</p>
            <div className="flex flex-col gap-2.5">
              {TEXTURE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-secondary">{cat.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {cat.textures.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        active={selectedTextures.includes(t)}
                        onClick={() => toggleIn(selectedTextures, onTexturesChange)(t)}
                        tone="accent2"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
