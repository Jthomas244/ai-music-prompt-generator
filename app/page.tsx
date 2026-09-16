"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { Logo } from "@/components/ui";
import { GENRES, MOODS, INFLUENCES, INSTRUMENTS, CHORD_VOICINGS, TIME_SIGNATURES, tempoForBpm, keyLabel } from "@/lib/knowledge-base";
import { PRESETS } from "@/lib/presets";
import { buildNaivePrompt, NEUTRAL_FEEL } from "@/lib/prompt-builder";
import { decodeSelection, encodeSelection, customInfluenceId } from "@/lib/share";
import { useLocalStorage } from "@/lib/storage";
import type { Influence, Picks, Preset, PromptHistoryEntry, Selection, UserPreset } from "@/lib/types";

const MAX_INFLUENCES = 5;
const MAX_HISTORY = 50;
const REPO_URL = "https://github.com/Jthomas244/ai-music-prompt-generator";

const EMPTY_PICKS: Picks = {
  genreId: "",
  moodId: "",
  bpm: null,
  key: "",
  instrumentIds: [],
  feel: { ...NEUTRAL_FEEL },
  avoid: "",
  influenceIds: [],
  timeSignatureIds: ["4-4"],
  chordVoicingIds: [],
  textures: [],
  promptLength: "standard",
  sunoMode: true,
  notes: "",
};

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

function samePicks(a: Picks, b: Partial<Picks>): boolean {
  return (
    a.genreId === (b.genreId ?? "") &&
    a.moodId === (b.moodId ?? "") &&
    a.bpm === (b.bpm ?? null) &&
    a.key === (b.key ?? "") &&
    a.promptLength === (b.promptLength ?? "standard") &&
    sameSet(a.instrumentIds, b.instrumentIds ?? []) &&
    sameSet(a.influenceIds, b.influenceIds ?? []) &&
    sameSet(a.timeSignatureIds, b.timeSignatureIds ?? ["4-4"]) &&
    sameSet(a.chordVoicingIds, b.chordVoicingIds ?? []) &&
    sameSet(a.textures, b.textures ?? []) &&
    a.feel.energy === (b.feel?.energy ?? 50) &&
    a.feel.warmth === (b.feel?.warmth ?? 50) &&
    a.feel.complexity === (b.feel?.complexity ?? 50)
  );
}

export default function Home() {
  const [picks, setPicks] = useState<Picks>(EMPTY_PICKS);

  // Persisted across visits
  const [customLibrary, setCustomLibrary, customsHydrated] = useLocalStorage<Influence[]>("toneprompt:custom-influences", []);
  const [history, setHistory, historyHydrated] = useLocalStorage<PromptHistoryEntry[]>("toneprompt:history", []);
  const [userPresets, setUserPresets] = useLocalStorage<UserPreset[]>("toneprompt:user-presets", []);

  // Describe-it intake
  const [parsing, setParsing] = useState(false);
  const [parseNote, setParseNote] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);

  // Output
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentHistoryEntry, setCurrentHistoryEntry] = useState<Omit<PromptHistoryEntry, "prompt"> | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  const outputRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((patch: Partial<Picks>) => setPicks((p) => ({ ...p, ...patch })), []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  // ── Derived objects ──
  const selectedGenre = GENRES.find((g) => g.id === picks.genreId) ?? null;
  const mood = MOODS.find((m) => m.id === picks.moodId) ?? null;
  const allInfluences = useMemo(() => [...customLibrary, ...INFLUENCES], [customLibrary]);
  const influences = useMemo(
    () => picks.influenceIds.map((id) => allInfluences.find((i) => i.id === id)).filter((i): i is Influence => !!i),
    [picks.influenceIds, allInfluences]
  );
  const instruments = INSTRUMENTS.filter((i) => picks.instrumentIds.includes(i.id));
  const timeSignatureObjects = TIME_SIGNATURES.filter((t) => picks.timeSignatureIds.includes(t.id));
  const chordVoicingObjects = picks.chordVoicingIds
    .map((id) => CHORD_VOICINGS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const hasOutput = generatedPrompt.length > 0;
  const canGenerate = selectedGenre !== null && mood !== null && picks.bpm !== null && !isStreaming;

  const activePresetId = useMemo(() => {
    const user = userPresets.find((p) => samePicks(picks, p.selection));
    if (user) return user.id;
    return PRESETS.find((p) => samePicks(picks, p.selection))?.id ?? null;
  }, [picks, userPresets]);

  const naivePrompt = currentHistoryEntry ? buildNaivePrompt(currentHistoryEntry.params) : "";

  const missingParts = [!selectedGenre && "genre", !mood && "mood", picks.bpm === null && "BPM"].filter((x): x is string => !!x);
  const missingSelections = missingParts.length > 1 ? `${missingParts.slice(0, -1).join(", ")} & ${missingParts.at(-1)}` : missingParts[0] ?? "";

  // ── Applying a whole selection (preset / parser / share link) ──
  const applySelection = useCallback(
    (sel: Partial<Selection>, source: "preset" | "describe" | "link") => {
      const customs = sel.customInfluences ?? [];
      if (customs.length) {
        setCustomLibrary((lib) => {
          const known = new Set(lib.map((c) => c.id));
          return [...customs.filter((c) => !known.has(c.id)), ...lib];
        });
      }
      const influenceIds = [...(sel.influenceIds ?? [])].slice(0, MAX_INFLUENCES);
      setPicks((prev) => ({
        ...prev,
        ...(sel.genreId !== undefined && { genreId: sel.genreId }),
        ...(sel.moodId !== undefined && { moodId: sel.moodId }),
        ...(sel.bpm !== undefined && { bpm: sel.bpm }),
        key: sel.key ?? "",
        instrumentIds: sel.instrumentIds ?? [],
        feel: sel.feel ? { ...sel.feel } : { ...NEUTRAL_FEEL },
        influenceIds,
        timeSignatureIds: sel.timeSignatureIds?.length ? sel.timeSignatureIds : ["4-4"],
        chordVoicingIds: sel.chordVoicingIds ?? [],
        textures: sel.textures ?? [],
        promptLength: sel.promptLength ?? prev.promptLength,
        ...(sel.sunoMode !== undefined && { sunoMode: sel.sunoMode }),
        avoid: sel.avoid ?? (source === "preset" ? "" : prev.avoid),
        ...(source === "preset" && { notes: sel.notes ?? "" }),
        ...(sel.notes !== undefined && source !== "preset" && { notes: sel.notes }),
      }));
    },
    [setCustomLibrary]
  );

  // Hydrate from a share link once the custom library is loaded (so merged customs persist), then clean the URL
  const linkHydrated = useRef(false);
  useEffect(() => {
    if (!customsHydrated || linkHydrated.current) return;
    linkHydrated.current = true;
    const decoded = decodeSelection(window.location.search);
    if (!decoded) return;
    applySelection(decoded, "link");
    window.history.replaceState(null, "", window.location.pathname);
    showToast("Loaded shared setup");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customsHydrated]);

  function handlePreset(preset: Preset) {
    applySelection(preset.selection, "preset");
    setParseNote(null);
    setParseError(null);
    showToast(`Preset loaded — ${preset.label}`);
  }

  function handleUserPreset(preset: UserPreset) {
    applySelection({ ...preset.selection, notes: preset.selection.notes, avoid: preset.selection.avoid }, "preset");
    setParseNote(null);
    setParseError(null);
    showToast(`Loaded “${preset.name}”`);
  }

  function handleSaveUserPreset(name: string) {
    if (!picks.genreId) return;
    const finalName = name || `Preset ${userPresets.length + 1}`;
    const preset: UserPreset = { id: `u-${Date.now()}`, name: finalName, createdAt: Date.now(), selection: { ...picks, feel: { ...picks.feel } } };
    setUserPresets((prev) => [...prev.filter((p) => p.name !== finalName), preset]);
    showToast(`Saved “${finalName}”`);
  }

  function handleDeleteUserPreset(id: string) {
    setUserPresets((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleParse() {
    const description = picks.notes.trim();
    if (!description || parsing) return;
    setParsing(true);
    setParseError(null);
    setParseNote(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json().catch(() => ({ error: "Request failed." }));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const customs: Influence[] = (data.customInfluences ?? []).map((c: { label: string; sonic: string; genres: string[] }) => ({
        id: customInfluenceId(c.label),
        label: c.label,
        sonic: c.sonic,
        genres: c.genres,
        custom: true,
      }));
      applySelection(
        {
          genreId: data.genreId,
          moodId: data.moodId,
          bpm: data.bpm,
          key: data.key ?? "",
          instrumentIds: data.instrumentIds ?? [],
          feel: { energy: data.energy ?? 50, warmth: data.warmth ?? 50, complexity: data.complexity ?? 50 },
          avoid: data.avoid ?? "",
          influenceIds: [...data.influenceIds, ...customs.map((c) => c.id)],
          customInfluences: customs,
          timeSignatureIds: data.timeSignatureIds,
          chordVoicingIds: data.chordVoicingIds,
          textures: data.textures,
          promptLength: data.promptLength,
          notes: description,
        },
        "describe"
      );
      setParseNote(data.note ?? "Controls filled from your description.");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Couldn't read that — try rephrasing.");
    } finally {
      setParsing(false);
    }
  }

  async function handleAddCustom(name: string): Promise<boolean> {
    if (addingCustom) return false;
    const id = customInfluenceId(name);
    const existing = allInfluences.find((i) => i.id === id || i.label.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!picks.influenceIds.includes(existing.id) && picks.influenceIds.length < MAX_INFLUENCES) {
        update({ influenceIds: [...picks.influenceIds, existing.id] });
      }
      return true;
    }
    setAddingCustom(true);
    try {
      const res = await fetch("/api/influence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, genreId: picks.genreId || undefined }),
      });
      const data = await res.json().catch(() => ({ error: "Request failed." }));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const inf: Influence = {
        id: customInfluenceId(data.label),
        label: data.label,
        sonic: data.sonic,
        genres: data.genres ?? [],
        searchTerms: data.searchTerms ?? [],
        custom: true,
      };
      setCustomLibrary((lib) => [inf, ...lib.filter((c) => c.id !== inf.id)]);
      setPicks((p) => ({
        ...p,
        influenceIds:
          p.influenceIds.includes(inf.id) || p.influenceIds.length >= MAX_INFLUENCES ? p.influenceIds : [...p.influenceIds, inf.id],
      }));
      showToast(`Added ${inf.label} — profiled by Claude`);
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't add that artist.");
      return false;
    } finally {
      setAddingCustom(false);
    }
  }

  function handleRemoveCustom(id: string) {
    setCustomLibrary((lib) => lib.filter((c) => c.id !== id));
    update({ influenceIds: picks.influenceIds.filter((x) => x !== id) });
  }

  function handleShare() {
    const customs = customLibrary.filter((c) => picks.influenceIds.includes(c.id));
    const query = encodeSelection({
      ...picks,
      influenceIds: picks.influenceIds.filter((id) => !id.startsWith("custom-")),
      customInfluences: customs,
    });
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    navigator.clipboard.writeText(url).then(
      () => showToast("Link copied — it reopens these exact selections"),
      () => showToast("Couldn't copy the link")
    );
  }

  const generate = useCallback(async () => {
    if (!canGenerate || !selectedGenre || !mood || picks.bpm === null) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsStreaming(true);
    setGeneratedPrompt("");
    setError(null);

    const entry: Omit<PromptHistoryEntry, "prompt"> = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      params: {
        genre: selectedGenre.label,
        mood: mood.label,
        tempo: `${picks.bpm} BPM`,
        key: keyLabel(picks.key) || undefined,
        instruments: instruments.map((i) => i.label),
        influences: influences.map((i) => i.label),
        timeSignatures: timeSignatureObjects.filter((t) => t.id !== "4-4").map((t) => t.label),
        chordVoicings: chordVoicingObjects.map((c) => c.label),
        textures: picks.textures,
        sunoMode: picks.sunoMode,
        promptLength: picks.promptLength,
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
          tempo: tempoForBpm(picks.bpm),
          bpm: picks.bpm,
          key: picks.key,
          instruments,
          feel: picks.feel,
          avoid: picks.avoid,
          influences,
          timeSignatures: timeSignatureObjects,
          chordVoicings: chordVoicingObjects,
          textures: picks.textures,
          sunoMode: picks.sunoMode,
          promptLength: picks.promptLength,
          notes: picks.notes,
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
      if (!fullText.trim()) throw new Error("Got an empty response — try again.");

      setGeneratedAt(Date.now());
      setHistory((prev) => [...prev, { ...entry, prompt: fullText }].slice(-MAX_HISTORY));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsStreaming(false);
    }
  }, [canGenerate, selectedGenre, mood, picks, instruments, influences, timeSignatureObjects, chordVoicingObjects, setHistory]);

  function handlePromptCommitted(prompt: string) {
    if (!currentHistoryEntry) return;
    setHistory((prev) => prev.map((h) => (h.id === currentHistoryEntry.id ? { ...h, prompt } : h)));
  }

  function handleHistorySelect(entry: PromptHistoryEntry) {
    setGeneratedPrompt(entry.prompt);
    setGeneratedAt(entry.timestamp);
    setCurrentHistoryEntry({ id: entry.id, timestamp: entry.timestamp, params: entry.params });
    setError(null);
    scrollToOutput();
  }

  function scrollToOutput() {
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleGenerateFromBar() {
    void generate();
    // Below lg the output is under the controls; bring it into view as it streams
    setTimeout(scrollToOutput, 150);
  }

  return (
    <>
      <MobileBottomBar
        canGenerate={canGenerate}
        isStreaming={isStreaming}
        hasOutput={hasOutput}
        prompt={generatedPrompt}
        missingSelections={missingSelections}
        onGenerate={handleGenerateFromBar}
        onRegenerate={handleGenerateFromBar}
        onJumpToOutput={scrollToOutput}
      />

      {/* Toast */}
      {toast && (
        <div
          key={toast}
          role="status"
          className="fixed left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-pill text-[12.5px] font-medium bg-panel border border-line-strong text-primary shadow-lg animate-fade-in pointer-events-none"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 84px)" }}
        >
          {toast}
        </div>
      )}

      <div className="min-h-screen lg:h-screen flex flex-col gap-6 px-4 py-6 sm:px-7 sm:py-7 xl:px-11 xl:py-11 pb-28 lg:pb-7 xl:pb-11">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo />
            <span className="font-serif font-semibold text-[22px] sm:text-[25px] tracking-[-0.01em] leading-none">TonePrompt</span>
            <span
              className="font-mono text-[11px] font-semibold tracking-[0.06em] px-[9px] py-[3px] rounded-pill"
              style={{ background: "var(--accent2)", color: "#15130F" }}
            >
              V4
            </span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-[26px] text-[13px] sm:text-[14px]">
            <button type="button" onClick={() => scrollToId("presets")} className="text-secondary hover:text-primary transition-colors">
              Presets
            </button>
            <button
              type="button"
              onClick={() => (history.length ? scrollToId("history") : showToast("Nothing generated yet"))}
              className="text-secondary hover:text-primary transition-colors"
            >
              History
            </button>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors">
              Docs
            </a>
          </nav>
        </header>

        {/* Body: fixed-width control panel + fluid output */}
        <main className="flex flex-col lg:flex-row gap-6 lg:gap-7 lg:flex-1 lg:min-h-0">
          <aside className="lg:w-[440px] lg:shrink-0 rounded-card border border-line bg-panel p-5 sm:p-7 lg:overflow-y-auto">
            <ControlPanel
              picks={picks}
              onChange={update}
              parsing={parsing}
              parseNote={parseNote}
              parseError={parseError}
              onParse={() => void handleParse()}
              customLibrary={customLibrary}
              onAddCustom={handleAddCustom}
              onRemoveCustom={handleRemoveCustom}
              addingCustom={addingCustom}
              userPresets={userPresets}
              activePresetId={activePresetId}
              onApplyPreset={handlePreset}
              onApplyUserPreset={handleUserPreset}
              onSaveUserPreset={handleSaveUserPreset}
              onDeleteUserPreset={handleDeleteUserPreset}
              canGenerate={canGenerate}
              isStreaming={isStreaming}
              missingSelections={missingSelections}
              onGenerate={() => void generate()}
            />
          </aside>

          <section ref={outputRef} className="flex-1 min-w-0 lg:overflow-y-auto scroll-mt-4 lg:pr-1">
            <OutputPanel
              prompt={generatedPrompt}
              isStreaming={isStreaming}
              generatedAt={generatedAt}
              onRegenerate={() => void generate()}
              canRegenerate={canGenerate}
              onPromptChange={setGeneratedPrompt}
              onPromptCommitted={handlePromptCommitted}
              onShare={handleShare}
              historyEntry={currentHistoryEntry}
              naivePrompt={naivePrompt}
              promptLength={picks.promptLength}
              sunoMode={picks.sunoMode}
              avoid={picks.avoid}
              history={historyHydrated ? history : []}
              onHistorySelect={handleHistorySelect}
              onHistoryClear={() => setHistory([])}
              error={error}
            />
          </section>
        </main>
      </div>
    </>
  );
}
