"use client";

import { useState, useRef, useCallback } from "react";
import { Music2 } from "lucide-react";
import { GenreCard } from "@/components/GenreCard";
import { ChipSelector } from "@/components/ChipSelector";
import { AdvancedPanel } from "@/components/AdvancedPanel";
import { PromptOutput } from "@/components/PromptOutput";
import { PlatformToggle } from "@/components/PlatformToggle";
import { PromptHistory } from "@/components/PromptHistory";
import { InfluenceSearch } from "@/components/InfluenceSearch";
import { PromptLengthToggle } from "@/components/PromptLengthToggle";
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
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [currentHistoryEntry, setCurrentHistoryEntry] = useState<
    Omit<PromptHistoryEntry, "prompt"> | undefined
  >(undefined);

  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const accentColor = selectedGenre?.color ?? DEFAULT_ACCENT;

  const mood = MOODS.find((m) => m.id === selectedMood) ?? null;
  const tempo = TEMPOS.find((t) => t.label === selectedTempo) ?? null;
  const influences = INFLUENCES.filter((i) => selectedInfluences.includes(i.id));
  const timeSignatureObjects = TIME_SIGNATURES.filter((t) => selectedTimeSigs.includes(t.id));

  const canGenerate = selectedGenre !== null && mood !== null && tempo !== null && !isStreaming;

  const filteredGenres = genreCategoryFilter === "all"
    ? GENRES
    : GENRES.filter((g) => g.category === genreCategoryFilter);

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
        timeSignatures: timeSignatureObjects
          .filter((t) => t.id !== "4-4")
          .map((t) => t.label),
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
    <div
      className="min-h-screen relative"
      style={{
        background: `radial-gradient(ellipse at 15% 15%, ${accentColor}0A 0%, transparent 55%),
                     radial-gradient(ellipse at 85% 85%, ${accentColor}07 0%, transparent 45%),
                     #141420`,
      }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}
      />

      <div className="relative max-w-4xl mx-auto px-4 py-14 space-y-14">

        {/* Header */}
        <header className="text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}40` }}
            >
              <Music2 className="w-6 h-6" style={{ color: accentColor }} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-primary">TonePrompt</h1>
            <p className="text-secondary text-base max-w-md mx-auto leading-relaxed">
              Describe what you want to hear, and we&apos;ll craft the perfect prompt for Suno and other AI music tools.
            </p>
          </div>
          <div className="flex justify-center pt-1">
            <PlatformToggle sunoMode={sunoMode} onChange={setSunoMode} accentColor={accentColor} />
          </div>
        </header>

        {/* Section 01 — Genre */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>01</span>
              <h2 className="section-label" style={{ color: accentColor }}>Genre</h2>
              <div className="flex-1 h-px bg-border" />
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
        </section>

        {/* Section 02 — Mood */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>02</span>
              <h2 className="section-label" style={{ color: accentColor }}>Mood</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <p className="text-sm text-secondary pl-1">How should the music feel?</p>
          </div>
          <ChipSelector
            items={MOODS}
            selected={selectedMood ? [selectedMood] : []}
            onToggle={(id) => setSelectedMood(selectedMood === id ? "" : id)}
            accentColor={accentColor}
          />
        </section>

        {/* Section 03 — Tempo */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>03</span>
              <h2 className="section-label" style={{ color: accentColor }}>Tempo</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <p className="text-sm text-secondary pl-1">How fast or slow should it be?</p>
          </div>
          <ChipSelector
            items={TEMPOS.map((t) => ({ id: t.label, label: t.label }))}
            selected={selectedTempo ? [selectedTempo] : []}
            onToggle={(id) => setSelectedTempo(selectedTempo === id ? "" : id)}
            accentColor={accentColor}
          />
        </section>

        {/* Section 04 — Sonic Influences */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>04</span>
              <h2 className="section-label" style={{ color: accentColor }}>Sonic Influences</h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted shrink-0">{selectedInfluences.length}/{MAX_INFLUENCES}</span>
            </div>
            <p className="text-sm text-secondary pl-1">
              Artists whose sound you want to channel — we&apos;ll translate their style, not their name.
              {selectedInfluences.length >= 4 && (
                <span className="text-yellow-400 ml-1">More influences = broader style. Consider narrowing for a more focused output.</span>
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
        </section>

        {/* Section 05 — Prompt Length */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>05</span>
              <h2 className="section-label" style={{ color: accentColor }}>Prompt Length</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <p className="text-sm text-secondary pl-1">How much detail should the prompt include?</p>
          </div>
          <PromptLengthToggle value={promptLength} onChange={setPromptLength} accentColor={accentColor} />
        </section>

        {/* Section 06 — Advanced */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: `${accentColor}20`, color: accentColor }}>06</span>
              <h2 className="section-label" style={{ color: accentColor }}>Fine-Tune Your Sound</h2>
              <div className="flex-1 h-px bg-border" />
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
        </section>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generate}
          disabled={!canGenerate}
          className="w-full py-5 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.99]"
          style={
            canGenerate
              ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: "#141420", boxShadow: `0 0 30px ${accentColor}40` }
              : { background: "rgba(255,255,255,0.04)", color: "#707080", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.08)" }
          }
        >
          {isStreaming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
              Generating prompt...
            </span>
          ) : !selectedGenre || !mood || !tempo ? (
            "Select genre, mood & tempo to generate"
          ) : (
            `Generate ${sunoMode ? "Suno" : "Music"} Prompt →`
          )}
        </button>

        {/* Output */}
        {(generatedPrompt || isStreaming) && (
          <div ref={outputRef} className="scroll-mt-8">
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

        {/* History */}
        {history.length > 0 && (
          <PromptHistory
            history={history}
            onSelect={handleHistorySelect}
            onClear={() => setHistory([])}
            accentColor={accentColor}
          />
        )}

        {/* Footer */}
        <footer className="text-center pt-8 pb-4 border-t border-border">
          <p className="text-xs text-muted font-mono">
            TonePrompt · Powered by Claude · Optimized for Suno
          </p>
        </footer>
      </div>
    </div>
  );
}
