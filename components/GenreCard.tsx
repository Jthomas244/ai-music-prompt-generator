"use client";

import { clsx } from "clsx";
import type { Genre } from "@/lib/types";

interface GenreCardProps {
  genre: Genre;
  selected: boolean;
  onSelect: (genre: Genre) => void;
}

export function GenreCard({ genre, selected, onSelect }: GenreCardProps) {
  return (
    <button
      onClick={() => onSelect(genre)}
      className={clsx(
        "relative w-full text-left p-4 rounded-xl transition-all duration-200 group",
        "border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        selected
          ? "border-opacity-60"
          : "border-border bg-surface hover:bg-surface-hover hover:border-border-strong"
      )}
      style={
        selected
          ? {
              borderColor: genre.color,
              background: `${genre.color}12`,
              boxShadow: `0 0 20px ${genre.color}20, inset 0 0 20px ${genre.color}08`,
            }
          : undefined
      }
      aria-pressed={selected}
    >
      {/* Glow blob on selected */}
      {selected && (
        <div
          className="absolute inset-0 rounded-xl opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${genre.color}, transparent 70%)`,
          }}
        />
      )}

      <div className="relative flex flex-col gap-2">
        {/* Icon + Label row */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-2xl leading-none"
            style={{ color: selected ? genre.color : "#A0A0B0" }}
          >
            {genre.icon}
          </span>
          {selected && (
            <span
              className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded border uppercase"
              style={{
                color: genre.color,
                borderColor: `${genre.color}50`,
                background: `${genre.color}15`,
              }}
            >
              Selected
            </span>
          )}
        </div>

        {/* Label */}
        <div>
          <p
            className="font-semibold text-sm transition-colors"
            style={{ color: selected ? genre.color : "#E8E8ED" }}
          >
            {genre.label}
          </p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            {genre.description}
          </p>
        </div>

        {/* Subgenre tags */}
        {genre.subgenres && (
          <div className="flex flex-wrap gap-1 mt-1">
            {genre.subgenres.slice(0, 2).map((sub) => (
              <span
                key={sub}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded text-muted"
                style={{
                  background: selected ? `${genre.color}15` : "rgba(255,255,255,0.04)",
                  color: selected ? `${genre.color}cc` : "#707080",
                }}
              >
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
