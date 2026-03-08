"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

  const activeCount =
    selectedTimeSigs.filter((s) => s !== "4-4").length +
    selectedChords.length +
    selectedTextures.length;

  function toggleTimeSig(id: string) {
    if (id === "4-4") {
      onTimeSigsChange(["4-4"]);
      return;
    }
    if (selectedTimeSigs.includes(id)) {
      const next = selectedTimeSigs.filter((s) => s !== id);
      onTimeSigsChange(next.length === 0 ? ["4-4"] : next);
    } else {
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

  const selectedSigLabels = TIME_SIGNATURES.filter(
    (s) => selectedTimeSigs.includes(s.id) && s.id !== "4-4"
  )
    .map((s) => s.label)
    .join(" + ");

  const chipStyle = (active: boolean) =>
    active
      ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor }
      : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#A8A8BC" };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header — shimmer hint when collapsed */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-surface-hover transition-colors duration-200 relative overflow-hidden"
      >
        {/* Subtle shimmer on collapsed state to invite interaction */}
        {!open && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${accentColor}08 50%, transparent 60%)`,
            }}
            aria-hidden="true"
          />
        )}

        <div className="flex items-center gap-3 relative z-10">
          {/* Animated chevron */}
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-flex"
          >
            <ChevronRight className="w-4 h-4 text-muted" />
          </motion.span>

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

        <span className="text-xs text-muted hidden sm:block relative z-10">
          {open ? "collapse ↑" : "expand ↓"}
        </span>
      </button>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }
            }
            style={{ overflow: "hidden" }}
          >
            {/* Accent top border pulse on open */}
            <div
              className="h-[1px] w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
            />

            <motion.div
              className="px-5 pb-5 pt-4 space-y-8 border-t border-border"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
              }}
            >
              {/* Time Signatures */}
              <motion.div
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
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
                  <p className="text-xs text-muted mt-1">
                    Select multiple to describe songs that shift between meters. Most music is 4/4.
                  </p>
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
                        className="px-3 py-2 rounded-full text-sm font-mono transition-all duration-150 border focus:outline-none text-left min-h-[44px]"
                        style={chipStyle(active)}
                      >
                        {sig.label}
                        <span className="hidden sm:block text-[9px] opacity-50 mt-0.5">{sig.description}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Chord Voicings */}
              <motion.div
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <div>
                  <span className="section-label">Chord Voicings</span>
                  <p className="text-xs text-muted mt-1">
                    The harmonic color of your music — pick one or two that match the feeling.
                  </p>
                </div>
                <div className="space-y-4">
                  {VOICING_CATEGORIES.map((cat) => {
                    const chords = CHORD_VOICINGS.filter((c) => c.category === cat.id);
                    return (
                      <div key={cat.id}>
                        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {chords.map((chord) => {
                            const active = selectedChords.includes(chord.id);
                            return (
                              <button
                                key={chord.id}
                                onClick={() => toggleChord(chord.id)}
                                title={chord.description}
                                className="px-3 py-2 rounded-full text-sm transition-all duration-150 border focus:outline-none text-left min-h-[44px]"
                                style={chipStyle(active)}
                              >
                                {chord.label}
                                <span className="block text-[9px] opacity-50 mt-0.5 font-mono">
                                  {chord.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Human Textures */}
              <motion.div
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <div>
                  <span className="section-label">Human Textures</span>
                  <p className="text-xs text-muted mt-1">
                    Little imperfections that make AI music sound real.
                  </p>
                </div>
                <div className="space-y-4">
                  {TEXTURE_CATEGORIES.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
                        {cat.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cat.textures.map((texture) => {
                          const active = selectedTextures.includes(texture);
                          return (
                            <button
                              key={texture}
                              onClick={() => toggleTexture(texture)}
                              className="px-3 py-2 rounded-full text-sm transition-all duration-150 border focus:outline-none min-h-[44px]"
                              style={chipStyle(active)}
                            >
                              {texture}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
