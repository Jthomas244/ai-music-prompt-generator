"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Music2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GenreCard } from "@/components/GenreCard";
import { ChipSelector } from "@/components/ChipSelector";
import { AdvancedPanel } from "@/components/AdvancedPanel";
import { PromptOutput } from "@/components/PromptOutput";
import { PlatformToggle } from "@/components/PlatformToggle";
import { PromptHistory } from "@/components/PromptHistory";
import { InfluenceSearch } from "@/components/InfluenceSearch";
import { PromptLengthToggle } from "@/components/PromptLengthToggle";
import { CursorGlow } from "@/components/CursorGlow";
import { MobileProgressDots } from "@/components/MobileProgressDots";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import {
  GENRES,
  MOODS,
  INFLUENCES,
  TEMPOS,
  CHORD_VOICINGS,
  TIME_SIGNATURES,
  GENRE_CATEGORIES,
} from "@/lib/knowledge-base";
import type { Genre, PromptHistoryEntry, PromptLength, GenreCategory } from "@/lib/types";

const DEFAULT_ACCENT = "#8B5CF6";
const MAX_INFLUENCES = 5;

// Shared spring config for section reveals
const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// Waveform bar animation delays and durations for organic feel
const WAVEFORM_BARS = [
  { delay: "0s",    duration: "0.6s" },
  { delay: "0.12s", duration: "0.5s" },
  { delay: "0.24s", duration: "0.7s" },
  { delay: "0.12s", duration: "0.55s" },
  { delay: "0s",    duration: "0.65s" },
];

export default function Home() {
  // Core selections
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreCategoryFilter, setGenreCategoryFilter] = useState<GenreCategory | "all">("all");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedTempo, setSelectedTempo] = useState<string>("");
  const [selectedInfluences, setSelectedInfluences] = useState<string[]>([]);
  const [sunoMode, setSunoMode] = useState(true);
  const [promptLength, setPromptLength] = useState<PromptLength>("standard");

  // Advanced
  const [selectedTimeSigs, setSelectedTimeSigs] = useState<string[]>(["4-4"]);
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);

  // Output
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [slowHint, setSlowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [currentHistoryEntry, setCurrentHistoryEntry] = useState<
    Omit<PromptHistoryEntry, "prompt"> | undefined
  >(undefined);

  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const slowHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const accentColor = selectedGenre?.color ?? DEFAULT_ACCENT;

  const mood = MOODS.find((m) => m.id === selectedMood) ?? null;
  const tempo = TEMPOS.find((t) => t.label === selectedTempo) ?? null;
  const influences = INFLUENCES.filter((i) => selectedInfluences.includes(i.id));
  const timeSignatureObjects = TIME_SIGNATURES.filter((t) => selectedTimeSigs.includes(t.id));
  const hasOutput = generatedPrompt.length > 0;

  const canGenerate = selectedGenre !== null && mood !== null && tempo !== null && !isStreaming;

  const filteredGenres =
    genreCategoryFilter === "all"
      ? GENRES
      : GENRES.filter((g) => g.category === genreCategoryFilter);

  // Progress steps for mobile dots
  const progressSteps = [
    { label: "Genre", done: !!selectedGenre, sectionId: "section-01" },
    { label: "Mood", done: !!selectedMood, sectionId: "section-02" },
    { label: "Tempo", done: !!selectedTempo, sectionId: "section-03" },
    { label: "Influences", done: selectedInfluences.length > 0, sectionId: "section-04" },
    { label: "Generate", done: hasOutput, sectionId: "section-output" },
  ];

  // Missing selections label for mobile bottom bar
  const missingSelections = [
    !selectedGenre && "genre",
    !mood && "mood",
    !tempo && "tempo",
  ]
    .filter(Boolean)
    .join(", ");

  // "Crafting your prompt..." slow hint after 2s of streaming
  useEffect(() => {
    if (isStreaming) {
      slowHintTimer.current = setTimeout(() => setSlowHint(true), 2000);
    } else {
      if (slowHintTimer.current) clearTimeout(slowHintTimer.current);
      setSlowHint(false);
    }
    return () => {
      if (slowHintTimer.current) clearTimeout(slowHintTimer.current);
    };
  }, [isStreaming]);

  function toggleInfluence(id: string) {
    if (selectedInfluences.includes(id)) {
      setSelectedInfluences(selectedInfluences.filter((x) => x !== id));
    } else if (selectedInfluences.length < MAX_INFLUENCES) {
      setSelectedInfluences([...selectedInfluences, id]);
    }
  }

  const generate = useCallback(async () => {
    if (!canGenerate || !selectedGenre || !mood || !tempo) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsStreaming(true);
    setGeneratedPrompt("");
    setError(null);

    const chordVoicingObjects = selectedChords
      .map((id) => CHORD_VOICINGS.find((c) => c.id === id)!)
      .filter(Boolean);

    const entry: Omit<PromptHistoryEntry, "prompt"> = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      params: {
        genre: selectedGenre.label,
        mood: mood.label,
        tempo: tempo.label,
        influences: influences.map((i) => i.label),
        timeSignatures: timeSignatureObjects.filter((t) => t.id !== "4-4").map((t) => t.label),
        chordVoicings: chordVoicingObjects.map((c) => c.label),
        textures: selectedTextures,
        sunoMode,
        promptLength,
      },
    };
    setCurrentHistoryEntry(entry);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          genre: selectedGenre,
          mood,
          tempo,
          influences,
          timeSignatures: timeSignatureObjects,
          chordVoicings: chordVoicingObjects,
          textures: selectedTextures,
          sunoMode,
          promptLength,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed." }));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body.");

      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setGeneratedPrompt(fullText);
      }

      setHistory((prev) => [...prev, { ...entry, prompt: fullText }]);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsStreaming(false);
    }
  }, [canGenerate, selectedGenre, mood, tempo, influences, timeSignatureObjects, selectedChords, selectedTextures, sunoMode, promptLength]);

  function handleHistorySelect(entry: PromptHistoryEntry) {
    setGeneratedPrompt(entry.prompt);
    setCurrentHistoryEntry({ id: entry.id, timestamp: entry.timestamp, params: entry.params });
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <>
      {/* Cursor glow — follows mouse on desktop */}
      <CursorGlow accentColor={accentColor} />

      {/* Mobile progress dots — fixed top bar */}
      <MobileProgressDots steps={progressSteps} accentColor={accentColor} />

      {/* Mobile bottom bar — fixed generate / copy+regen */}
      <MobileBottomBar
        canGenerate={canGenerate}
        isStreaming={isStreaming}
        hasOutput={hasOutput}
        prompt={generatedPrompt}
        accentColor={accentColor}
        missingSelections={missingSelections}
        onGenerate={generate}
        onRegenerate={generate}
      />

      <div
        className="min-h-screen relative"
        style={{
          background: `
            radial-gradient(ellipse at 10% 10%, ${accentColor}0E 0%, transparent 50%),
            radial-gradient(ellipse at 88% 80%, ${accentColor}08 0%, transparent 45%),
            radial-gradient(ellipse at 50% 50%, ${accentColor}04 0%, transparent 70%),
            #141420
          `,
          transition: "background 0.8s ease",
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.022]"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Main content */}
        <div
          className="relative max-w-4xl mx-auto px-4 space-y-14"
          style={{
            paddingTop: "3.5rem",
            /* On mobile: top pad for progress dots + bottom pad for bottom bar */
            paddingBottom: hasOutput || canGenerate || isStreaming ? "5.5rem" : "2rem",
          }}
        >

          {/* ── Header ── */}
          <motion.header
            className="text-center space-y-5"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}40`, transition: "background 0.5s ease, border-color 0.5s ease" }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.08, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Music2 className="w-6 h-6" style={{ color: accentColor }} />
              </motion.div>
            </div>
            <div className="space-y-2">
              <motion.h1
                className="text-5xl font-bold tracking-tight text-primary"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                TonePrompt
              </motion.h1>
              <motion.p
                className="text-secondary text-base max-w-md mx-auto leading-relaxed"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Describe what you want to hear, and we&apos;ll craft the perfect prompt for Suno and other AI music tools.
              </motion.p>
            </div>
            <motion.div
              className="flex justify-center pt-1"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <PlatformToggle sunoMode={sunoMode} onChange={setSunoMode} accentColor={accentColor} />
            </motion.div>
          </motion.header>

          {/* ── Section 01 — Genre ── */}
          <motion.section
            id="section-01"
            className="space-y-5 scroll-mt-12"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionVariants}
          >
            <div className="space-y-1">
              <div className="relative flex items-center gap-3 overflow-hidden">
                {/* Editorial background number */}
                <span
                  className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono font-black pointer-events-none select-none"
                  aria-hidden="true"
                  style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.1, color: accentColor, transition: "color 0.5s ease" }}
                >
                  01
                </span>
                <span
                  className="relative z-10 font-mono text-xs font-bold px-2 py-1 rounded"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  01
                </span>
                <h2 className="relative z-10 section-label" style={{ color: accentColor }}>Genre</h2>
                <div className="relative z-10 flex-1 h-px bg-border" />
              </div>
              <p className="text-sm text-secondary pl-1">Pick the style that fits your vibe.</p>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setGenreCategoryFilter("all")}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border focus:outline-none"
                style={
                  genreCategoryFilter === "all"
                    ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor }
                    : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#A8A8BC" }
                }
              >
                All
              </button>
              {GENRE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setGenreCategoryFilter(cat.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border focus:outline-none"
                  style={
                    genreCategoryFilter === cat.id
                      ? { borderColor: `${accentColor}80`, background: `${accentColor}20`, color: accentColor }
                      : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#A8A8BC" }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Genre grid — 2 col mobile, 3 col tablet, 4 col desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGenres.map((genre) => (
                <GenreCard
                  key={genre.id}
                  genre={genre}
                  selected={selectedGenre?.id === genre.id}
                  onSelect={(g) => setSelectedGenre(selectedGenre?.id === g.id ? null : g)}
                />
              ))}
            </div>
          </motion.section>

          {/* ── Sections 02 + 03 side by side on tablet+ ── */}
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">

            {/* Section 02 — Mood */}
            <motion.section
              id="section-02"
              className="space-y-5 scroll-mt-12"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={sectionVariants}
            >
              <div className="space-y-1">
                <div className="relative flex items-center gap-3 overflow-hidden">
                  <span
                    className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono font-black pointer-events-none select-none"
                    aria-hidden="true"
                    style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.1, color: accentColor, transition: "color 0.5s ease" }}
                  >
                    02
                  </span>
                  <span className="relative z-10 font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>02</span>
                  <h2 className="relative z-10 section-label" style={{ color: accentColor }}>Mood</h2>
                  <div className="relative z-10 flex-1 h-px bg-border" />
                </div>
                <p className="text-sm text-secondary pl-1">How should the music feel?</p>
              </div>
              <ChipSelector
                items={MOODS}
                selected={selectedMood ? [selectedMood] : []}
                onToggle={(id) => setSelectedMood(selectedMood === id ? "" : id)}
                accentColor={accentColor}
              />
            </motion.section>

            {/* Section 03 — Tempo */}
            <motion.section
              id="section-03"
              className="space-y-5 scroll-mt-12"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={sectionVariants}
            >
              <div className="space-y-1">
                <div className="relative flex items-center gap-3 overflow-hidden">
                  <span
                    className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono font-black pointer-events-none select-none"
                    aria-hidden="true"
                    style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.1, color: accentColor, transition: "color 0.5s ease" }}
                  >
                    03
                  </span>
                  <span className="relative z-10 font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>03</span>
                  <h2 className="relative z-10 section-label" style={{ color: accentColor }}>Tempo</h2>
                  <div className="relative z-10 flex-1 h-px bg-border" />
                </div>
                <p className="text-sm text-secondary pl-1">How fast or slow should it be?</p>
              </div>
              <ChipSelector
                items={TEMPOS.map((t) => ({ id: t.label, label: t.label }))}
                selected={selectedTempo ? [selectedTempo] : []}
                onToggle={(id) => setSelectedTempo(selectedTempo === id ? "" : id)}
                accentColor={accentColor}
              />
            </motion.section>

          </div>

          {/* ── Section 04 — Sonic Influences ── */}
          <motion.section
            id="section-04"
            className="space-y-5 scroll-mt-12"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionVariants}
          >
            <div className="space-y-1">
              <div className="relative flex items-center gap-3 overflow-hidden">
                <span
                  className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono font-black pointer-events-none select-none"
                  aria-hidden="true"
                  style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.1, color: accentColor, transition: "color 0.5s ease" }}
                >
                  04
                </span>
                <span className="relative z-10 font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>04</span>
                <h2 className="relative z-10 section-label" style={{ color: accentColor }}>Sonic Influences</h2>
                <div className="relative z-10 flex-1 h-px bg-border" />
                <span className="relative z-10 text-xs text-muted shrink-0">{selectedInfluences.length}/{MAX_INFLUENCES}</span>
              </div>
              <p className="text-sm text-secondary pl-1">
                Artists whose sound you want to channel — we&apos;ll translate their style, not their name.
                {selectedInfluences.length >= 4 && (
                  <span className="text-yellow-400 ml-1">
                    More influences = broader style. Consider narrowing for a more focused output.
                  </span>
                )}
              </p>
            </div>
            <InfluenceSearch
              selectedIds={selectedInfluences}
              onToggle={toggleInfluence}
              genreId={selectedGenre?.id}
              accentColor={accentColor}
              max={MAX_INFLUENCES}
            />
          </motion.section>

          {/* ── Section 05 — Prompt Length ── */}
          <motion.section
            className="space-y-5 scroll-mt-12"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionVariants}
          >
            <div className="space-y-1">
              <div className="relative flex items-center gap-3 overflow-hidden">
                <span
                  className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono font-black pointer-events-none select-none"
                  aria-hidden="true"
                  style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.1, color: accentColor, transition: "color 0.5s ease" }}
                >
                  05
                </span>
                <span className="relative z-10 font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>05</span>
                <h2 className="relative z-10 section-label" style={{ color: accentColor }}>Prompt Length</h2>
                <div className="relative z-10 flex-1 h-px bg-border" />
              </div>
              <p className="text-sm text-secondary pl-1">How much detail should the prompt include?</p>
            </div>
            <PromptLengthToggle value={promptLength} onChange={setPromptLength} accentColor={accentColor} />
          </motion.section>

          {/* ── Section 06 — Advanced ── */}
          <motion.section
            className="space-y-5 scroll-mt-12"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionVariants}
          >
            <div className="space-y-1">
              <div className="relative flex items-center gap-3 overflow-hidden">
                <span
                  className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono font-black pointer-events-none select-none"
                  aria-hidden="true"
                  style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.1, color: accentColor, transition: "color 0.5s ease" }}
                >
                  06
                </span>
                <span className="relative z-10 font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>06</span>
                <h2 className="relative z-10 section-label" style={{ color: accentColor }}>Fine-Tune Your Sound</h2>
                <div className="relative z-10 flex-1 h-px bg-border" />
              </div>
            </div>
            <AdvancedPanel
              selectedTimeSigs={selectedTimeSigs}
              onTimeSigsChange={setSelectedTimeSigs}
              selectedChords={selectedChords}
              onChordsChange={setSelectedChords}
              selectedTextures={selectedTextures}
              onTexturesChange={setSelectedTextures}
              accentColor={accentColor}
            />
          </motion.section>

          {/* ── Error ── */}
          {error && (
            <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono">
              {error}
            </div>
          )}

          {/* ── Generate Button — desktop only (mobile has MobileBottomBar) ── */}
          <motion.div
            className="hidden md:block"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionVariants}
          >
            <motion.button
              onClick={generate}
              disabled={!canGenerate}
              className="relative w-full py-5 rounded-2xl text-base font-bold tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 overflow-hidden"
              style={
                canGenerate
                  ? {
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                      color: "#141420",
                      boxShadow: `0 0 32px ${accentColor}45`,
                      transition: "box-shadow 0.3s ease",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#707080",
                      cursor: "not-allowed",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
              whileHover={prefersReducedMotion || !canGenerate ? undefined : { scale: 1.015 }}
              whileTap={prefersReducedMotion || !canGenerate ? undefined : { scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              {/* Shimmer sweep — only on active state */}
              {canGenerate && (
                <span
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                >
                  <span
                    className="absolute top-0 bottom-0 w-1/3 animate-shimmer"
                    style={{
                      background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.18), transparent)",
                    }}
                  />
                </span>
              )}

              {/* Button content */}
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isStreaming ? (
                  <>
                    {/* Waveform bars */}
                    <span className="flex items-end gap-[3px]" style={{ height: 18 }}>
                      {WAVEFORM_BARS.map((bar, i) => (
                        <span
                          key={i}
                          className="w-[3px] rounded-full bg-current animate-waveform"
                          style={{
                            height: "100%",
                            animationDelay: bar.delay,
                            animationDuration: bar.duration,
                          }}
                        />
                      ))}
                    </span>
                    Generating prompt...
                  </>
                ) : !selectedGenre || !mood || !tempo ? (
                  "Select genre, mood & tempo to generate"
                ) : (
                  `Generate ${sunoMode ? "Suno" : "Music"} Prompt →`
                )}
              </span>
            </motion.button>

            {/* Slow hint — appears after 2s of streaming */}
            {slowHint && (
              <motion.p
                className="text-center text-xs text-muted mt-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Crafting your prompt...
              </motion.p>
            )}
          </motion.div>

          {/* ── Output ── */}
          {(generatedPrompt || isStreaming) && (
            <div id="section-output" ref={outputRef} className="scroll-mt-8">
              <PromptOutput
                prompt={generatedPrompt}
                isStreaming={isStreaming}
                onRegenerate={generate}
                onPromptChange={setGeneratedPrompt}
                historyEntry={currentHistoryEntry}
                accentColor={accentColor}
                promptLength={promptLength}
              />
            </div>
          )}

          {/* ── History ── */}
          {history.length > 0 && (
            <PromptHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={() => setHistory([])}
              accentColor={accentColor}
            />
          )}

          {/* ── Footer ── */}
          <footer className="text-center pt-8 pb-4 border-t border-border">
            <p className="text-xs text-muted font-mono">
              TonePrompt · Powered by Claude · Optimized for Suno
            </p>
          </footer>

        </div>
      </div>
    </>
  );
}
