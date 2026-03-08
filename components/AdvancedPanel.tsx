"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { TIME_SIGNATURES, CHORD_VOICINGS, VOICING_CATEGORIES, TEXTURE_CATEGORIES } from "@/lib/knowledge-base";

interface AdvancedPanelProps {
  selectedTimeSigs: string[];
  onTimeSigsChange: (sigs: string[]) => void;
  selectedChords: string[];
  onChordsChange: (ids: string[]) => void;
  selectedTextures: string[];
  onTexturesChange: (textures: string[]) => void;
  accentColor?: string;
}

export function AdvancedPanel({
  selectedTimeSigs,
  onTimeSigsChange,
  selectedChords,
  onChordsChange,
  selectedTextures,
  onTexturesChange,
  accentColor = "#8B5CF6",
}: AdvancedPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = selectedTimeSigs.filter((s) => s !== "4-4").length + selectedChords.length + selectedTextures.length;

  function toggleTimeSig(id: string) {
    if (id === "4-4") {
      // selecting standard resets to just 4/4
      onTimeSigsChange(["4-4"]);
      return;
    }
    if (selectedTimeSigs.includes(id)) {
      const next = selectedTimeSigs.filter((s) => s !== id);
      onTimeSigsChange(next.length === 0 ? ["4-4"] : next);
    } else {
      // Remove the default 4/4 when picking something else
      const without4 = selectedTimeSigs.filter((s) => s !== "4-4");
      onTimeSigsChange([...without4, id]);
    }
  }

  function toggleChord(id: string) {
    if (selectedChords.includes(id)) {
      onChordsChange(selectedChords.filter((c) => c !== id));
    } else {
      onChordsChange([...selectedChords, id]);
    }
  }

  function toggleTexture(t: string) {
    if (selectedTextures.includes(t)) {
      onTexturesChange(selectedTextures.filter((x) => x !== t));
    } else {
      onTexturesChange([...selectedTextures, t]);
    }
  }

  const selectedSigLabels = TIME_SIGNATURES
    .filter((s) => selectedTimeSigs.includes(s.id) && s.id !== "4-4")
    .map((s) => s.label)
    .join(" + ");

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-surface-hover transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={clsx("w-4 h-4 text-muted transition-transform duration-200", open && "rotate-90")} />
          <div className="text-left">
            <span className="section-label">Fine-Tune Your Sound</span>
            <p className="text-xs text-muted mt-0.5">Optional — for when you want extra control</p>
          </div>
          {activeCount > 0 && (
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${accentColor}25`, color: accentColor }}
            >
              {activeCount} active
            </span>
          )}
        </div>
        <span className="text-xs text-muted hidden sm:block">{open ? "collapse ↑" : "expand ↓"}</span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 pt-4 space-y-8 border-t border-border animate-fade-in">

          {/* Time Signatures — multi-select */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="section-label">Time Signatures</span>
                {selectedSigLabels && (
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${accentColor}20`, color: accentColor }}
                  >
                    {selectedSigLabels}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1">Select multiple to describe songs that shift between meters. Most music is 4/4.</p>
              {selectedTimeSigs.filter((s) => s !== "4-4").length >= 2 && (
                <p className="text-xs mt-1" style={{ color: accentColor }}>
                  The prompt will describe the interplay between these meters.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {TIME_SIGNATURES.map((sig) => {
                const active = selectedTimeSigs.includes(sig.id);
                return (
                  <button
                    key={sig.id}
                    onClick={() => toggleTimeSig(sig.id)}
                    title={sig.description}
                    className="px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-150 border focus:outline-none text-left"
                    style={
                      active
                        ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor }
                        : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#A8A8BC" }
                    }
                  >
                    {sig.label}
                    <span className="hidden sm:block text-[9px] opacity-50 mt-0.5">{sig.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chord Voicings — category grouped */}
          <div className="space-y-3">
            <div>
              <span className="section-label">Chord Voicings</span>
              <p className="text-xs text-muted mt-1">The harmonic color of your music — pick one or two that match the feeling.</p>
            </div>
            <div className="space-y-4">
              {VOICING_CATEGORIES.map((cat) => {
                const chords = CHORD_VOICINGS.filter((c) => c.category === cat.id);
                return (
                  <div key={cat.id}>
                    <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">{cat.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {chords.map((chord) => {
                        const active = selectedChords.includes(chord.id);
                        return (
                          <button
                            key={chord.id}
                            onClick={() => toggleChord(chord.id)}
                            title={chord.description}
                            className="px-3 py-1.5 rounded-full text-sm transition-all duration-150 border focus:outline-none text-left"
                            style={
                              active
                                ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor }
                                : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#A8A8BC" }
                            }
                          >
                            {chord.label}
                            <span className="block text-[9px] opacity-50 mt-0.5 font-mono">{chord.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Human Textures — category grouped */}
          <div className="space-y-3">
            <div>
              <span className="section-label">Human Textures</span>
              <p className="text-xs text-muted mt-1">Little imperfections that make AI music sound real.</p>
            </div>
            <div className="space-y-4">
              {TEXTURE_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.textures.map((texture) => {
                      const active = selectedTextures.includes(texture);
                      return (
                        <button
                          key={texture}
                          onClick={() => toggleTexture(texture)}
                          className="px-3 py-1.5 rounded-full text-sm transition-all duration-150 border focus:outline-none"
                          style={
                            active
                              ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor }
                              : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#A8A8BC" }
                          }
                        >
                          {texture}
                        </button>
                      );
                    })}
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
