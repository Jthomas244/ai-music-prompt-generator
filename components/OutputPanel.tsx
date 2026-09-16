"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, RefreshCw, Minimize2, Link2, Undo2, Eye, EyeOff, CornerDownLeft } from "lucide-react";
import { clsx } from "clsx";
import { SunoKitPanel } from "./SunoKitPanel";
import { RecentRow } from "./RecentRow";
import { WORD_TARGETS } from "@/lib/prompt-builder";
import { MODEL_LABEL } from "@/lib/model-label";
import type { PromptHistoryEntry, PromptLength, SunoKit } from "@/lib/types";

interface OutputPanelProps {
  prompt: string;
  isStreaming: boolean;
  generatedAt: number | null;
  onRegenerate: () => void;
  canRegenerate: boolean;
  onPromptChange: (p: string) => void;
  /** Called once a refine/compress finishes so the page can update history. */
  onPromptCommitted: (p: string) => void;
  onShare: () => void;
  historyEntry?: Omit<PromptHistoryEntry, "prompt">;
  naivePrompt: string;
  promptLength: PromptLength;
  sunoMode: boolean;
  avoid: string;
  history: PromptHistoryEntry[];
  onHistorySelect: (entry: PromptHistoryEntry) => void;
  onHistoryClear: () => void;
  error: string | null;
}

const TIER_LIMITS: Record<PromptLength, [number, number]> = {
  concise:  [40,  70],
  standard: [70, 120],
  detailed: [120, 180],
};

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

const REFINE_CHIPS = ["Darker", "Warmer & more lo-fi", "More energetic", "Instrumental only", "Add vocals", "Less reverb"];

function relative(ts: number | null): string {
  if (!ts) return "";
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

export function OutputPanel({
  prompt,
  isStreaming,
  generatedAt,
  onRegenerate,
  canRegenerate,
  onPromptChange,
  onPromptCommitted,
  onShare,
  historyEntry,
  naivePrompt,
  promptLength,
  sunoMode,
  avoid,
  history,
  onHistorySelect,
  onHistoryClear,
  error,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refineError, setRefineError] = useState<string | null>(null);
  const [previousPrompt, setPreviousPrompt] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [scrambledText, setScrambledText] = useState<string | null>(null);
  const [kit, setKit] = useState<SunoKit | null>(null);
  const [kitLoading, setKitLoading] = useState(false);
  const [kitError, setKitError] = useState<string | null>(null);
  const [kitVocals, setKitVocals] = useState(false);
  const scrambleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const refineAbort = useRef<AbortController | null>(null);

  // A fresh generation invalidates everything derived from the old prompt.
  useEffect(() => {
    if (isStreaming) {
      setKit(null);
      setKitError(null);
      setPreviousPrompt(null);
      setRefineError(null);
      setCopied(false);
      refineAbort.current?.abort();
    }
  }, [isStreaming]);

  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const [minWords, maxWords] = TIER_LIMITS[promptLength];
  const busy = isStreaming || isRefining;
  const hasPrompt = prompt.length > 0;
  const isOverLimit = wordCount > maxWords && !busy && hasPrompt;
  const isUnderRange = wordCount < minWords && !busy && wordCount > 0;

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function runRefine(instruction: string) {
    if (!prompt || busy) return;
    refineAbort.current?.abort();
    refineAbort.current = new AbortController();
    const before = prompt;
    setIsRefining(true);
    setRefineError(null);
    setKit(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: refineAbort.current.signal,
        body: JSON.stringify({ prompt, instruction, promptLength, sunoMode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed." }));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body.");
      const decoder = new TextDecoder();
      let revised = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        revised += decoder.decode(value, { stream: true });
        onPromptChange(revised);
      }
      if (!revised.trim()) throw new Error("Got an empty rewrite — try again.");
      setPreviousPrompt(before);
      setRefineText("");
      onPromptCommitted(revised);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      onPromptChange(before);
      setRefineError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsRefining(false);
    }
  }

  function handleUndo() {
    if (!previousPrompt) return;
    onPromptChange(previousPrompt);
    onPromptCommitted(previousPrompt);
    setPreviousPrompt(null);
    setKit(null);
  }

  async function handleBuildKit() {
    if (!prompt || busy) return;
    setKitLoading(true);
    setKitError(null);
    try {
      const res = await fetch("/api/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, vocals: kitVocals, avoid }),
      });
      const data = await res.json().catch(() => ({ error: "Request failed." }));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setKit(data as SunoKit);
    } catch (err) {
      setKitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setKitLoading(false);
    }
  }

  function handleRegenerate() {
    if (!canRegenerate || busy) return;
    if (!prompt) {
      onRegenerate();
      return;
    }
    // Scramble current text for 350ms, then fire the new call
    const steps = 12;
    let step = 0;
    scrambleInterval.current = setInterval(() => {
      step++;
      setScrambledText(
        prompt
          .split("")
          .map((c) => (c === " " || c === "\n" ? c : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
          .join("")
      );
      if (step >= steps) {
        clearInterval(scrambleInterval.current!);
        setScrambledText(null);
        onRegenerate();
      }
    }, Math.round(350 / steps));
  }

  const displayText = scrambledText ?? prompt;

  const paramTags = historyEntry
    ? [
        historyEntry.params.genre,
        historyEntry.params.mood,
        historyEntry.params.tempo,
        historyEntry.params.key,
        ...historyEntry.params.timeSignatures.filter((s) => s !== "4/4"),
        ...(historyEntry.params.instruments ?? []),
        ...historyEntry.params.influences,
        ...historyEntry.params.chordVoicings,
        ...historyEntry.params.textures,
      ].filter((t): t is string => !!t)
    : [];

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Heading + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-serif font-semibold text-[19px] leading-none">Generated Prompt</h2>
        <div className="flex gap-2.5">
          <button type="button" onClick={handleCopy} disabled={!hasPrompt || busy} className="btn-outline" aria-label="Copy prompt">
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: "var(--accent2)" }} /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button type="button" onClick={handleRegenerate} disabled={!canRegenerate || busy} className="btn-outline" aria-label="Regenerate prompt">
            <RefreshCw className={clsx("w-3.5 h-3.5", (isStreaming || !!scrambledText) && "animate-spin")} />
            <span>{hasPrompt ? "Regenerate" : "Generate"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-control border border-[#E07A6A]/40 bg-[#E07A6A]/10 px-4 py-3 text-[13px] text-[#F0A08F] font-mono">{error}</div>
      )}

      {/* Output card */}
      <div className="rounded-card border border-line bg-raised p-6 sm:p-[30px] min-h-[240px] flex flex-col gap-4">
        {showCompare && naivePrompt && hasPrompt && !isStreaming && (
          <div className="border-b border-line pb-4 animate-fade-in">
            <span className="label">What most people would type</span>
            <p className="font-mono text-[13.5px] text-secondary line-through decoration-secondary/60 mt-1.5">{naivePrompt}</p>
            <p className="text-[12px] text-secondary mt-1.5">
              Same intent, {Math.max(1, Math.round(wordCount / Math.max(1, naivePrompt.split(/\s+/).length)))}× the detail — and none of the artist names Suno ignores.
            </p>
          </div>
        )}

        {!hasPrompt && !isStreaming ? (
          <div className="flex-1 flex flex-col justify-center gap-2 text-secondary">
            <p className="font-mono text-[14.5px] leading-[1.75] text-secondary/80">
              Your prompt lands here — 70–120 words of production-level direction, streamed as it&apos;s written.
            </p>
            <p className="text-[12.5px]">Pick a genre, mood, and BPM (or describe the vibe and let Claude fill the controls), then generate.</p>
          </div>
        ) : isStreaming && !prompt ? (
          <div className="flex items-center gap-2 text-secondary text-[13px]">
            <span className="inline-block w-2 h-4 rounded-sm animate-pulse-glow" style={{ background: "var(--accent)" }} />
            Generating…
          </div>
        ) : (
          <p
            className="font-mono text-[14.5px] leading-[1.75] whitespace-pre-line"
            style={{ color: scrambledText ? "rgb(var(--accent-rgb) / 0.55)" : "#E9E2D3", transition: "color 0.08s" }}
          >
            {displayText}
            {busy && <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse-glow" style={{ background: "var(--accent)" }} />}
          </p>
        )}

        {isOverLimit && (
          <p className="text-[12px]" style={{ color: "var(--accent)" }}>
            {wordCount - maxWords} words over the {promptLength} target — hit Shorten, or switch to Detailed.
          </p>
        )}

        {hasPrompt && !isStreaming && (
          <div className="flex flex-col gap-3 border-t border-line pt-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void runRefine(`Shorten this to ${WORD_TARGETS[promptLength]} while keeping the most impactful descriptors — genre, mood, and the key sonic textures.`)}
                disabled={busy}
                className="btn-outline btn-outline-sm"
                title="Shorten with AI while keeping the best descriptors"
              >
                <Minimize2 className="w-3 h-3" /> Shorten
              </button>
              {previousPrompt !== null && (
                <button type="button" onClick={handleUndo} disabled={busy} className="btn-outline btn-outline-sm" title="Restore the prompt from before the last rewrite">
                  <Undo2 className="w-3 h-3" /> Undo
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCompare((v) => !v)}
                disabled={isStreaming || !naivePrompt}
                aria-pressed={showCompare}
                className="btn-outline btn-outline-sm"
                style={showCompare ? { borderColor: "var(--accent2)", color: "var(--accent2)" } : undefined}
                title="Show what a plain, unassisted prompt would look like"
              >
                {showCompare ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} vs. naive
              </button>
              <span className="flex-1" />
              <button type="button" onClick={onShare} disabled={isStreaming} className="btn-outline btn-outline-sm" title="Copy a link that reopens these exact selections">
                <Link2 className="w-3 h-3" /> Share setup
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="label">Refine</span>
              {REFINE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void runRefine(chip)}
                  disabled={busy}
                  className="px-2.5 py-1 rounded-pill text-[11.5px] font-medium border border-line-strong bg-fill text-secondary hover:text-primary hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (refineText.trim()) void runRefine(refineText.trim());
              }}
              className="relative"
            >
              <input
                type="text"
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                disabled={busy}
                maxLength={300}
                placeholder="Or say it in your own words — “swap the trumpet for a Rhodes”, “make the drums brushed”…"
                className="field field-sm !pr-11"
                aria-label="Refine instruction"
              />
              <button
                type="submit"
                disabled={busy || !refineText.trim()}
                aria-label="Apply refinement"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-control-sm flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ background: refineText.trim() && !busy ? "var(--accent)" : "rgba(255,255,255,0.08)", color: refineText.trim() && !busy ? "#15130F" : "#A79A85" }}
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
            {refineError && <p className="text-[12px] text-[#E07A6A]">{refineError}</p>}
          </div>
        )}
      </div>

      {/* Meta row */}
      {hasPrompt && !isStreaming && (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono text-[12px] text-secondary">
          <span>{MODEL_LABEL}</span>
          <span>·</span>
          <span style={{ color: isOverLimit ? "var(--accent)" : isUnderRange ? "var(--accent)" : undefined }}>{wordCount} words</span>
          <span>·</span>
          <span>{isRefining ? "Rewriting…" : relative(generatedAt)}</span>
          {paramTags.length > 0 && (
            <>
              <span>·</span>
              <span className="text-secondary/80 truncate max-w-full">{paramTags.join(" / ")}</span>
            </>
          )}
        </div>
      )}

      {/* Suno Kit */}
      {hasPrompt && !isStreaming && (
        <div className="rounded-card border border-line bg-panel p-5 sm:p-6">
          <SunoKitPanel
            kit={kit}
            loading={kitLoading}
            error={kitError}
            vocals={kitVocals}
            onVocalsChange={setKitVocals}
            onBuild={() => void handleBuildKit()}
            disabled={busy || !prompt}
          />
        </div>
      )}

      {/* Recent */}
      <RecentRow history={history} activeId={historyEntry?.id} onSelect={onHistorySelect} onClear={onHistoryClear} />
    </div>
  );
}
