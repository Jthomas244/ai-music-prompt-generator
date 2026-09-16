"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Waveform } from "./ui";

interface MobileBottomBarProps {
  canGenerate: boolean;
  isStreaming: boolean;
  hasOutput: boolean;
  prompt: string;
  missingSelections: string;
  onGenerate: () => void;
  onRegenerate: () => void;
  onJumpToOutput: () => void;
}

/** Fixed action bar below the lg breakpoint, where the control panel is inline and long. */
export function MobileBottomBar({
  canGenerate,
  isStreaming,
  hasOutput,
  prompt,
  missingSelections,
  onGenerate,
  onRegenerate,
  onJumpToOutput,
}: MobileBottomBarProps) {
  const [copied, setCopied] = useState(false);

  const visible = canGenerate || isStreaming || hasOutput;
  if (!visible) return null;

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-ground/95 backdrop-blur border-t border-line-strong"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="px-4 pt-3 flex gap-2">
        {hasOutput && !isStreaming ? (
          <>
            <button type="button" onClick={handleCopy} disabled={!prompt} className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2 text-[14px]">
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy prompt</>}
            </button>
            <button type="button" onClick={onJumpToOutput} className="btn-outline">View</button>
            <button type="button" onClick={onRegenerate} disabled={isStreaming || !canGenerate} className="btn-outline" aria-label="Regenerate">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button type="button" onClick={onGenerate} disabled={!canGenerate || isStreaming} className="btn-primary !py-3 flex items-center justify-center gap-2 text-[14px]">
            {isStreaming ? <><Waveform bars={5} height={14} /> Generating…</> : canGenerate ? "Generate Prompt" : `Select ${missingSelections}`}
          </button>
        )}
      </div>
    </div>
  );
}
