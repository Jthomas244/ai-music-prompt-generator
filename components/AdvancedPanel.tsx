"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { ChipSelector } from "./ChipSelector";
import { TIME_SIGNATURES, CHORD_VOICINGS, TEXTURES } from "@/lib/knowledge-base";

interface AdvancedPanelProps {
  timeSig: string;
  onTimeSigChange: (sig: string) => void;
  selectedChords: string[];
  onChordsChange: (ids: string[]) => void;
  selectedTextures: string[];
  onTexturesChange: (textures: string[]) => void;
  accentColor?: string;
}

export function AdvancedPanel({
  timeSig,
  onTimeSigChange,
  selectedChords,
  onChordsChange,
  selectedTextures,
  onTexturesChange,
  accentColor = "#8B5CF6",
}: AdvancedPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount =
    (timeSig !== "4/4" ? 1 : 0) + selectedChords.length + selectedTextures.length;

  const timeSigItems = TIME_SIGNATURES.map((sig) => ({ id: sig, label: sig }));
  const chordItems = CHORD_VOICINGS.map((c) => ({ ...c }));
  const textureItems = TEXTURES.map((t) => ({ id: t, label: t }));

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

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={clsx(
              "w-4 h-4 text-muted transition-transform duration-200",
              open && "rotate-90"
            )}
          />
          <span className="section-label">Advanced Parameters</span>
          {activeCount > 0 && (
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${accentColor}25`,
                color: accentColor,
              }}
            >
              {activeCount} active
            </span>
          )}
        </div>
        <span className="text-xs text-muted">
          {open ? "collapse" : "time sigs · chords · textures"}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 pt-4 space-y-6 border-t border-border animate-fade-in">
          {/* Time Signatures */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="section-label">Time Signature</span>
              {timeSig !== "4/4" && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  {timeSig}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {timeSigItems.map((sig) => (
                <button
                  key={sig.id}
                  onClick={() => onTimeSigChange(sig.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-150",
                    "border focus:outline-none"
                  )}
                  style={
                    timeSig === sig.id
                      ? {
                          borderColor: `${accentColor}80`,
                          background: `${accentColor}20`,
                          color: accentColor,
                        }
                      : {
                          borderColor: "rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                          color: "#A0A0B0",
                        }
                  }
                >
                  {sig.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chord Voicings */}
          <div className="space-y-3">
            <span className="section-label">Chord Voicings</span>
            <div className="flex flex-wrap gap-2">
              {chordItems.map((chord) => {
                const active = selectedChords.includes(chord.id);
                return (
                  <button
                    key={chord.id}
                    onClick={() => toggleChord(chord.id)}
                    title={chord.description}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-sm transition-all duration-150 border focus:outline-none"
                    )}
                    style={
                      active
                        ? {
                            borderColor: `${accentColor}80`,
                            background: `${accentColor}20`,
                            color: accentColor,
                          }
                        : {
                            borderColor: "rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                            color: "#A0A0B0",
                          }
                    }
                  >
                    {chord.label}
                    <span className="block text-[9px] opacity-60 mt-0.5 font-mono">
                      {chord.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Human Textures */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="section-label">Human Texture Details</span>
              <span className="text-xs text-muted">make it sound organic</span>
            </div>
            <ChipSelector
              items={textureItems}
              selected={selectedTextures}
              onToggle={(id) => toggleTexture(id)}
              accentColor={accentColor}
            />
          </div>
        </div>
      )}
    </div>
  );
}
