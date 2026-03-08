"use client";

import { useState, useRef } from "react";
import { Copy, Check, RefreshCw, Sparkles, Minimize2 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { PromptHistoryEntry, PromptLength } from "@/lib/types";

interface PromptOutputProps {
  prompt: string;
  isStreaming: boolean;
  onRegenerate: () => void;
  onPromptChange: (p: string) => void;
  historyEntry?: Omit<PromptHistoryEntry, "prompt">;
  accentColor?: string;
  promptLength?: PromptLength;
}

const TIER_LIMITS: Record<PromptLength, [number, number]> = {
  concise:  [40,  70],
  standard: [70, 120],
  detailed: [120, 180],
};

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

export function PromptOutput({
  prompt,
  isStreaming,
  onRegenerate,
  onPromptChange,
  historyEntry,
  accentColor = "#8B5CF6",
  promptLength = "standard",
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [scrambledText, setScrambledText] = useState<string | null>(null);
  const scrambleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const charCount = prompt.length;
  const [minWords, maxWords] = TIER_LIMITS[promptLength];

  const isOverLimit = wordCount > maxWords && !isStreaming && prompt.length > 0;
  const isUnderRange = wordCount < minWords && !isStreaming && wordCount > 0;
  const countColor = isOverLimit ? "#EF4444" : isUnderRange ? "#F59E0B" : "#10B981";

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCompress() {
    if (!prompt || isCompressing) return;
    setIsCompressing(true);
    try {
      const res = await fetch("/api/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, promptLength }),
      });
      if (!res.ok) return;
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let compressed = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        compressed += decoder.decode(value, { stream: true });
        onPromptChange(compressed);
      }
    } finally {
      setIsCompressing(false);
    }
  }

  function handleRegenerate() {
    if (prefersReducedMotion || !prompt) {
      onRegenerate();
      return;
    }
    // Scramble current text for 350ms, then fire the new call
    const steps = 12;
    const intervalMs = Math.round(350 / steps);
    let step = 0;
    scrambleInterval.current = setInterval(() => {
      step++;
      setScrambledText(
        prompt
          .split("")
          .map((c) =>
            c === " " || c === "\n"
              ? c
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          )
          .join("")
      );
      if (step >= steps) {
        clearInterval(scrambleInterval.current!);
        setScrambledText(null);
        onRegenerate();
      }
    }, intervalMs);
  }

  const displayText = scrambledText ?? prompt;

  const paramTags = historyEntry
    ? [
        historyEntry.params.genre,
        historyEntry.params.mood,
        historyEntry.params.tempo,
        ...historyEntry.params.timeSignatures.filter((s) => s !== "4/4"),
        ...historyEntry.params.influences,
        ...historyEntry.params.chordVoicings,
        ...historyEntry.params.textures,
      ].filter(Boolean)
    : [];

  return (
    <motion.div
      className="space-y-3"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Label above */}
      {!isStreaming && prompt && (
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
          <p className="text-sm font-medium text-primary">
            Your prompt is ready — paste this into Suno or any AI music tool
          </p>
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${accentColor}40` }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: `${accentColor}10`, borderColor: `${accentColor}25` }}
        >
          <div className="flex items-center gap-3">
            <span className="section-label" style={{ color: accentColor }}>Generated Prompt</span>
            {prompt && !isStreaming && (
              <span className="text-[10px] font-mono" style={{ color: countColor }}>
                {wordCount} words · {charCount} chars
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isStreaming || isCompressing}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200",
                "border border-border hover:border-border-strong text-secondary hover:text-primary",
                (isStreaming || isCompressing) && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={clsx("w-3 h-3", (isStreaming || !!scrambledText) && "animate-spin")} />
              Try again
            </button>
            {prompt && !isStreaming && (
              <button
                onClick={handleCompress}
                disabled={isCompressing}
                title="Shorten with AI while keeping the best descriptors"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200",
                  "border border-border hover:border-border-strong text-secondary hover:text-primary",
                  isCompressing && "opacity-50 cursor-not-allowed"
                )}
              >
                <Minimize2 className={clsx("w-3 h-3", isCompressing && "animate-spin")} />
                {isCompressing ? "Compressing..." : "Compress"}
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!prompt || isStreaming}
              className={clsx(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
                !prompt || isStreaming
                  ? "opacity-40 cursor-not-allowed border border-border text-muted"
                  : "shadow-md active:scale-95"
              )}
              style={
                prompt && !isStreaming
                  ? { background: accentColor, color: "#141420", boxShadow: `0 4px 16px ${accentColor}40` }
                  : undefined
              }
            >
              {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy prompt</>}
            </button>
          </div>
        </div>

        {/* Over-limit warning */}
        {isOverLimit && (
          <div className="px-5 py-2 border-b border-yellow-500/20 bg-yellow-500/08 flex items-center gap-2">
            <span className="text-yellow-400 text-xs">
              ⚠ This prompt is {wordCount - maxWords} words over the {promptLength} target. Hit &ldquo;Compress&rdquo; to trim it, or switch to Detailed mode.
            </span>
          </div>
        )}

        {/* Prompt text */}
        <div className="p-5" style={{ background: `${accentColor}06` }}>
          {isStreaming && !prompt ? (
            <div className="flex items-center gap-2 text-muted text-sm">
              <span className="inline-block w-2 h-4 rounded-sm animate-pulse-glow" style={{ background: accentColor }} />
              Generating...
            </div>
          ) : (
            <p
              className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                color: scrambledText ? `${accentColor}70` : "#EAEAF0",
                transition: "color 0.08s",
              }}
            >
              {displayText}
              {isStreaming && (
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 animate-pulse-glow align-middle"
                  style={{ background: accentColor }}
                />
              )}
            </p>
          )}
        </div>

        {/* Params summary — staggered reveal */}
        <AnimatePresence>
          {historyEntry && !isStreaming && paramTags.length > 0 && (
            <motion.div
              className="px-5 py-3 border-t flex flex-wrap gap-2"
              style={{ borderColor: `${accentColor}20` }}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
              }}
            >
              <span className="section-label mr-1 self-center">Params:</span>
              {paramTags.map((tag, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    borderColor: `${accentColor}30`,
                    color: `${accentColor}cc`,
                    background: `${accentColor}10`,
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
