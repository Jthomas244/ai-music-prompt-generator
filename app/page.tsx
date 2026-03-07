"use client";

import { useState, useRef, useCallback } from "react";
import { Music2 } from "lucide-react";
import { GenreCard } from "@/components/GenreCard";
import { ChipSelector } from "@/components/ChipSelector";
import { AdvancedPanel } from "@/components/AdvancedPanel";
import { PromptOutput } from "@/components/PromptOutput";
import { PlatformToggle } from "@/components/PlatformToggle";
import { PromptHistory } from "@/components/PromptHistory";
import {
  GENRES,
  MOODS,
  INFLUENCES,
  TEMPOS,
  CHORD_VOICINGS,
} from "@/lib/knowledge-base";
import type { Genre, PromptHistoryEntry } from "@/lib/types";

const DEFAULT_ACCENT = "#8B5CF6";

export default function Home() {
  // Core selections
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedTempo, setSelectedTempo] = useState<string>("");
  const [selectedInfluences, setSelectedInfluences] = useState<string[]>([]);
  const [sunoMode, setSunoMode] = useState(true);

  // Advanced
  const [timeSig, setTimeSig] = useState("4/4");
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

  // Derived helpers
  const mood = MOODS.find((m) => m.id === selectedMood) ?? null;
  const tempo = TEMPOS.find((t) => t.label === selectedTempo) ?? null;
  const influences = INFLUENCES.filter((i) => selectedInfluences.includes(i.id));

  const canGenerate = selectedGenre !== null && mood !== null && tempo !== null && !isStreaming;

  function toggleInfluence(id: string) {
    if (selectedInfluences.includes(id)) {
      setSelectedInfluences(selectedInfluences.filter((x) => x !== id));
    } else if (selectedInfluences.length < 3) {
      setSelectedInfluences([...selectedInfluences, id]);
    }
  }

  // Smart suggestions: sort influences so genre-matched ones come first
  const sortedInfluences = selectedGenre
    ? [...INFLUENCES].sort((a, b) => {
        const aMatch = a.genres.includes(selectedGenre.id) ? -1 : 1;
        const bMatch = b.genres.includes(selectedGenre.id) ? -1 : 1;
        return aMatch - bMatch;
      })
    : INFLUENCES;

  const generate = useCallback(async () => {
    if (!canGenerate || !selectedGenre || !mood || !tempo) return;

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
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
        timeSig,
        chordVoicings: chordVoicingObjects.map((c) => c.label),
        textures: selectedTextures,
        sunoMode,
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
          timeSig,
          chordVoicings: chordVoicingObjects,
          textures: selectedTextures,
          sunoMode,
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
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setGeneratedPrompt(fullText);
      }

      // Add to history
      setHistory((prev) => [...prev, { ...entry, prompt: fullText }]);

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsStreaming(false);
    }
  }, [canGenerate, selectedGenre, mood, tempo, influences, timeSig, selectedChords, selectedTextures, sunoMode]);

  function handleHistorySelect(entry: PromptHistoryEntry) {
    setGeneratedPrompt(entry.prompt);
    setCurrentHistoryEntry({
      id: entry.id,
      timestamp: entry.timestamp,
      params: entry.params,
    });
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `radial-gradient(ellipse at 20% 20%, ${accentColor}08 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 80%, ${accentColor}05 0%, transparent 40%),
                     #0A0A0F`,
      }}
    >
      {/* Subtle noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
            >
              <Music2 className="w-5 h-5" style={{ color: accentColor }} />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            AI Music Prompt Generator
          </h1>
          <p className="text-secondary text-base max-w-lg mx-auto leading-relaxed">
            Engineer expert-level prompts for Suno and other AI music platforms.
            Select your parameters and let Claude do the heavy lifting.
          </p>

          {/* Platform toggle in header */}
          <div className="flex justify-center pt-2">
            <PlatformToggle
              sunoMode={sunoMode}
              onChange={setSunoMode}
              accentColor={accentColor}
            />
          </div>
        </header>

        {/* Section 01 — Genre */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2 py-1 rounded"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              01
            </span>
            <h2 className="section-label text-sm" style={{ color: accentColor }}>
              Genre
            </h2>
            <div className="flex-1 h-px bg-border" />
            {!selectedGenre && (
              <span className="text-xs text-muted">Required</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GENRES.map((genre) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                selected={selectedGenre?.id === genre.id}
                onSelect={(g) => {
                  setSelectedGenre(selectedGenre?.id === g.id ? null : g);
                  // Reset influences if they don't pair with new genre
                }}
              />
            ))}
          </div>
        </section>

        {/* Section 02 — Mood */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2 py-1 rounded"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              02
            </span>
            <h2 className="section-label text-sm" style={{ color: accentColor }}>
              Mood
            </h2>
            <div className="flex-1 h-px bg-border" />
            {!selectedMood && (
              <span className="text-xs text-muted">Required</span>
            )}
          </div>
          <ChipSelector
            items={MOODS}
            selected={selectedMood ? [selectedMood] : []}
            onToggle={(id) => setSelectedMood(selectedMood === id ? "" : id)}
            accentColor={accentColor}
          />
        </section>

        {/* Section 03 — Tempo */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2 py-1 rounded"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              03
            </span>
            <h2 className="section-label text-sm" style={{ color: accentColor }}>
              Tempo
            </h2>
            <div className="flex-1 h-px bg-border" />
            {!selectedTempo && (
              <span className="text-xs text-muted">Required</span>
            )}
          </div>
          <ChipSelector
            items={TEMPOS.map((t) => ({ id: t.label, label: t.label }))}
            selected={selectedTempo ? [selectedTempo] : []}
            onToggle={(id) => setSelectedTempo(selectedTempo === id ? "" : id)}
            accentColor={accentColor}
          />
        </section>

        {/* Section 04 — Sonic Influences */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2 py-1 rounded"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              04
            </span>
            <h2 className="section-label text-sm" style={{ color: accentColor }}>
              Sonic Influences
            </h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">
              {selectedInfluences.length}/3 selected
            </span>
          </div>
          {selectedGenre && (
            <p className="text-xs text-muted -mt-1">
              <span style={{ color: accentColor }}>★</span> Highlights show best matches for {selectedGenre.label}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {sortedInfluences.map((inf) => {
              const active = selectedInfluences.includes(inf.id);
              const isMatch = selectedGenre?.id
                ? inf.genres.includes(selectedGenre.id)
                : false;
              const disabled =
                selectedInfluences.length >= 3 && !active;

              return (
                <button
                  key={inf.id}
                  onClick={() => toggleInfluence(inf.id)}
                  disabled={disabled}
                  title={inf.sonic}
                  className="relative px-3 py-1.5 rounded-full text-sm transition-all duration-150 border focus:outline-none"
                  style={
                    active
                      ? {
                          borderColor: `${accentColor}80`,
                          background: `${accentColor}20`,
                          color: accentColor,
                          opacity: 1,
                        }
                      : disabled
                      ? {
                          borderColor: "rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)",
                          color: "#707080",
                          opacity: 0.4,
                          cursor: "not-allowed",
                        }
                      : {
                          borderColor: isMatch
                            ? `${accentColor}40`
                            : "rgba(255,255,255,0.08)",
                          background: isMatch
                            ? `${accentColor}08`
                            : "rgba(255,255,255,0.03)",
                          color: isMatch ? "#E8E8ED" : "#A0A0B0",
                        }
                  }
                >
                  {isMatch && !active && (
                    <span className="mr-1" style={{ color: accentColor }}>★</span>
                  )}
                  {inf.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 05 — Advanced */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2 py-1 rounded"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              05
            </span>
            <h2 className="section-label text-sm" style={{ color: accentColor }}>
              Advanced Parameters
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <AdvancedPanel
            timeSig={timeSig}
            onTimeSigChange={setTimeSig}
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
        <div className="flex flex-col items-stretch gap-3">
          <button
            onClick={generate}
            disabled={!canGenerate}
            className="w-full py-4 rounded-xl text-base font-bold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 relative overflow-hidden"
            style={
              canGenerate
                ? {
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    color: "#0A0A0F",
                    boxShadow: `0 0 30px ${accentColor}40`,
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "#707080",
                    cursor: "not-allowed",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }
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
        </div>

        {/* Output */}
        {(generatedPrompt || isStreaming) && (
          <div ref={outputRef} className="scroll-mt-8">
            <PromptOutput
              prompt={generatedPrompt}
              isStreaming={isStreaming}
              onRegenerate={generate}
              historyEntry={currentHistoryEntry}
              accentColor={accentColor}
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
            Powered by Claude · Optimized for Suno · Built for prompt engineering
          </p>
        </footer>
      </div>
    </div>
  );
}
