"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { clsx } from "clsx";
import { Waveform } from "./ui";
import type { SunoKit } from "@/lib/types";

interface SunoKitPanelProps {
  kit: SunoKit | null;
  loading: boolean;
  error: string | null;
  vocals: boolean;
  onVocalsChange: (v: boolean) => void;
  onBuild: () => void;
  disabled: boolean;
}

export function formatStructure(kit: SunoKit): string {
  return kit.structure.map((s) => `[${s.tag}: ${s.direction}]`).join("\n\n");
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  async function copy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
  }
  return { copiedKey, copy };
}

/**
 * Everything else Suno's Custom mode wants after you paste the style prompt:
 * a title, an "Exclude Styles" list, and section tags for the lyrics field.
 */
export function SunoKitPanel({ kit, loading, error, vocals, onVocalsChange, onBuild, disabled }: SunoKitPanelProps) {
  const { copiedKey, copy } = useCopy();

  const copyBtn = (key: string, text: string, label = "Copy") => (
    <button type="button" onClick={() => void copy(key, text)} className="btn-outline btn-outline-sm">
      {copiedKey === key ? <Check className="w-3 h-3" style={{ color: "var(--accent2)" }} /> : <Copy className="w-3 h-3" />}
      {copiedKey === key ? "Copied" : label}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-serif font-semibold text-[19px]">Suno Kit</span>
          <span className="text-[12px] text-secondary hidden sm:inline">title · exclude styles · structure tags</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-pill border border-line-strong bg-fill p-0.5">
            {[
              { v: false, label: "Instrumental" },
              { v: true, label: "Vocals" },
            ].map(({ v, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => onVocalsChange(v)}
                disabled={loading}
                aria-pressed={vocals === v}
                className="px-3 py-1 text-[12px] font-medium rounded-pill transition-colors"
                style={vocals === v ? { background: "var(--accent2)", color: "#15130F" } : { color: "#A79A85" }}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onBuild} disabled={disabled || loading} className="btn-outline">
            {loading ? <Waveform bars={3} height={11} /> : null}
            {loading ? "Building…" : kit ? "Rebuild kit" : "Build kit"}
          </button>
        </div>
      </div>

      {error && <p className="text-[12px] text-[#E07A6A]">{error}</p>}

      {!kit && !loading && !error && (
        <p className="text-[12px] text-secondary">
          Paste the prompt into Suno&apos;s <span className="text-primary">Style of Music</span> field, then build the kit for the rest of the form.
        </p>
      )}

      {loading && !kit && (
        <p className="text-[13px] text-secondary flex items-center gap-2">
          <span className="inline-block w-2 h-4 rounded-sm animate-pulse-glow" style={{ background: "var(--accent2)" }} />
          Reading the prompt and drafting titles, exclusions, and a section map…
        </p>
      )}

      {kit && (
        <div className={clsx("grid gap-3 md:grid-cols-3 animate-fade-in", loading && "opacity-50")}>
          <div className="rounded-item border border-line bg-panel p-4 flex flex-col gap-3">
            <span className="label">Title</span>
            <ul className="flex flex-col gap-1.5">
              {kit.titles.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => void copy(`title:${t}`, t)}
                    className="group w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-control-sm border border-line hover:border-line-strong bg-fill transition-colors"
                  >
                    <span className="text-[13px] font-medium">{t}</span>
                    {copiedKey === `title:${t}` ? (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent2)" }} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 shrink-0 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {kit.hookIdea && (
              <div>
                <span className="label">Hook idea</span>
                <p className="text-[13px] text-secondary italic leading-relaxed mt-1">&ldquo;{kit.hookIdea}&rdquo;</p>
              </div>
            )}
          </div>

          <div className="rounded-item border border-line bg-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="label">Exclude styles</span>
              {copyBtn("exclude", kit.excludeStyles.join(", "))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {kit.excludeStyles.map((s) => (
                <span key={s} className="font-mono text-[12px] px-2 py-1 rounded-control-sm border border-line-strong bg-fill text-primary">
                  − {s}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-secondary leading-relaxed">Drop these into Suno&apos;s Exclude Styles box to keep it from drifting.</p>
          </div>

          <div className="rounded-item border border-line bg-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="label">Structure</span>
              {copyBtn("structure", formatStructure(kit), "Copy for lyrics")}
            </div>
            <ol className="flex flex-col gap-2">
              {kit.structure.map((s, i) => (
                <li key={i} className="text-[12px] leading-relaxed">
                  <span className="font-mono font-medium" style={{ color: "var(--accent2)" }}>[{s.tag}]</span>{" "}
                  <span className="text-secondary">{s.direction}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-secondary leading-relaxed">
              {vocals ? "Paste into the Lyrics field and write your lines under each tag." : "Paste into the Lyrics field as-is — bracketed lines steer the arrangement without being sung."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
