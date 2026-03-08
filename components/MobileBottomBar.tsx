"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

interface MobileBottomBarProps {
  canGenerate: boolean;
  isStreaming: boolean;
  hasOutput: boolean;
  prompt: string;
  accentColor: string;
  missingSelections: string;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function MobileBottomBar({
  canGenerate,
  isStreaming,
  hasOutput,
  prompt,
  accentColor,
  missingSelections,
  onGenerate,
  onRegenerate,
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
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        background: "rgba(20, 20, 32, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: `1px solid ${accentColor}30`,
      }}
    >
      <div className="px-4 pt-3 pb-0">
        {hasOutput && !isStreaming ? (
          /* Output visible: Copy + Regenerate */
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!prompt}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
              style={{ background: accentColor, color: "#141420" }}
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Prompt</>
              )}
            </button>
            <button
              onClick={onRegenerate}
              disabled={isStreaming}
              className="px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95"
              style={{
                borderColor: `${accentColor}40`,
                color: accentColor,
                background: `${accentColor}12`,
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Generate button */
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isStreaming}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98]"
            style={
              canGenerate
                ? {
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    color: "#141420",
                    boxShadow: `0 0 20px ${accentColor}30`,
                  }
                : {
                    background: "rgba(255,255,255,0.06)",
                    color: "#707080",
                    cursor: "not-allowed",
                  }
            }
          >
            {isStreaming
              ? "Generating..."
              : canGenerate
              ? "Generate Prompt →"
              : `Select ${missingSelections}`}
          </button>
        )}
      </div>
    </div>
  );
}
