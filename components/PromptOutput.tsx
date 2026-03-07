"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { PromptHistoryEntry } from "@/lib/types";

interface PromptOutputProps {
  prompt: string;
  isStreaming: boolean;
  onRegenerate: () => void;
  historyEntry?: Omit<PromptHistoryEntry, "prompt">;
  accentColor?: string;
}

export function PromptOutput({
  prompt,
  isStreaming,
  onRegenerate,
  historyEntry,
  accentColor = "#8B5CF6",
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border overflow-hidden animate-fade-in" style={{ borderColor: `${accentColor}40` }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{
          background: `${accentColor}10`,
          borderColor: `${accentColor}30`,
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
          <span className="section-label" style={{ color: accentColor }}>
            Generated Prompt
          </span>
          {prompt && !isStreaming && (
            <span className="text-[10px] font-mono text-muted ml-1">
              {wordCount} words
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={isStreaming}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
              "border border-border hover:border-border-strong text-secondary hover:text-primary",
              isStreaming && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={clsx("w-3 h-3", isStreaming && "animate-spin")} />
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            disabled={!prompt || isStreaming}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
              !prompt || isStreaming
                ? "opacity-40 cursor-not-allowed border border-border text-muted"
                : "border text-sm font-medium"
            )}
            style={
              prompt && !isStreaming
                ? {
                    borderColor: `${accentColor}60`,
                    background: `${accentColor}20`,
                    color: accentColor,
                  }
                : undefined
            }
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt text */}
      <div className="p-5" style={{ background: `${accentColor}06` }}>
        {isStreaming && !prompt ? (
          <div className="flex items-center gap-2 text-muted text-sm">
            <span className="inline-block w-2 h-4 rounded-sm animate-pulse-glow" style={{ background: accentColor }} />
            Generating...
          </div>
        ) : (
          <p className="font-mono text-sm leading-relaxed text-primary whitespace-pre-wrap">
            {prompt}
            {isStreaming && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 animate-pulse-glow align-middle"
                style={{ background: accentColor }}
              />
            )}
          </p>
        )}
      </div>

      {/* Params summary */}
      {historyEntry && !isStreaming && (
        <div
          className="px-5 py-3 border-t flex flex-wrap gap-2"
          style={{ borderColor: `${accentColor}20` }}
        >
          <span className="section-label mr-1 self-center">Params:</span>
          {[
            historyEntry.params.genre,
            historyEntry.params.mood,
            historyEntry.params.tempo,
            ...historyEntry.params.influences,
            historyEntry.params.timeSig !== "4/4"
              ? historyEntry.params.timeSig
              : null,
            ...historyEntry.params.chordVoicings,
            ...historyEntry.params.textures,
          ]
            .filter(Boolean)
            .map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  borderColor: `${accentColor}30`,
                  color: `${accentColor}cc`,
                  background: `${accentColor}10`,
                }}
              >
                {tag}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
