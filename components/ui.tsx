"use client";

import { clsx } from "clsx";

/** The recurring caption: GENRE, MOOD, INSTRUMENTATION… */
export function Label({ children, htmlFor, className, aside }: { children: React.ReactNode; htmlFor?: string; className?: string; aside?: React.ReactNode }) {
  const inner = <span className={clsx("label", className)}>{children}</span>;
  if (!aside) return htmlFor ? <label htmlFor={htmlFor} className="block">{inner}</label> : inner;
  return (
    <div className="flex items-center justify-between gap-3">
      {htmlFor ? <label htmlFor={htmlFor}>{inner}</label> : inner}
      <span className="text-[11px] text-secondary">{aside}</span>
    </div>
  );
}

export type ChipTone = "accent" | "accent2";

interface ChipProps {
  label: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone?: ChipTone;
  disabled?: boolean;
  title?: string;
  /** Dashed outline — used for custom, user-added items. */
  dashed?: boolean;
  /** Renders a small × after the label (custom influences, saved presets). */
  onRemove?: () => void;
  removeLabel?: string;
  size?: "md" | "sm";
}

/**
 * Pill button. Inactive chips share one look regardless of family; active chips take the
 * family's accent as a flat fill with near-black text.
 */
export function Chip({ label, active, onClick, tone = "accent", disabled, title, dashed, onRemove, removeLabel, size = "md" }: ChipProps) {
  const fill = tone === "accent" ? "var(--accent)" : "var(--accent2)";
  return (
    <span className={clsx("relative inline-flex", onRemove && "group")}>
      <button
        type="button"
        onClick={() => !disabled && onClick()}
        disabled={disabled}
        aria-pressed={active}
        title={title}
        className={clsx(
          "rounded-pill border font-medium transition-[background,border-color,color,opacity] duration-150 whitespace-nowrap",
          size === "md" ? "px-3.5 py-2 text-[13px]" : "px-3 py-1.5 text-[12px]",
          onRemove && "pr-8",
          disabled && "cursor-not-allowed opacity-40",
          !active && !disabled && "hover:border-line-strong hover:text-primary"
        )}
        style={
          active
            ? { background: fill, borderColor: fill, color: "#15130F", borderStyle: "solid" }
            : {
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "#A79A85",
                borderStyle: dashed ? "dashed" : "solid",
              }
        }
      >
        {label}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? "Remove"}
          title={removeLabel ?? "Remove"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[15px] leading-none transition-colors hover:bg-black/15"
          style={{ color: active ? "#15130F" : "#A79A85" }}
        >
          ×
        </button>
      )}
    </span>
  );
}

interface SliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/** Native range input, restyled; value shown as a mono number right-aligned above the track. */
export function Slider({ id, label, value, onChange, min = 0, max = 100, disabled }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[13px] text-secondary">
        <label htmlFor={id}>{label}</label>
        <span className="font-mono text-primary tabular-nums">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={() => onChange(50)}
        title="Double-click to reset"
      />
    </div>
  );
}

/** Four-bar wordmark glyph — two bars in each accent. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="10" width="3" height="8" rx="1.5" fill="var(--accent)" />
      <rect x="8" y="4" width="3" height="20" rx="1.5" fill="var(--accent)" />
      <rect x="14" y="8" width="3" height="12" rx="1.5" fill="var(--accent2)" />
      <rect x="20" y="1" width="3" height="26" rx="1.5" fill="var(--accent2)" />
    </svg>
  );
}

/** Small waveform used inside buttons while a request is in flight. */
export function Waveform({ bars = 4, height = 12 }: { bars?: number; height?: number }) {
  return (
    <span className="inline-flex items-end gap-[2px]" style={{ height }} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-current animate-waveform"
          style={{ height: "100%", animationDelay: `${i * 0.11}s`, animationDuration: `${0.55 + (i % 3) * 0.08}s`, transformOrigin: "bottom" }}
        />
      ))}
    </span>
  );
}
