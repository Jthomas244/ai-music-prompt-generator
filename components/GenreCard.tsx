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
        "relative w-full text-left p-5 rounded-2xl transition-all duration-250 group",
        "border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        selected
          ? "border-opacity-70"
          : "border-border bg-surface hover:bg-surface-hover hover:border-border-strong hover:scale-[1.01]"
      )}
      style={
        selected
          ? {
              borderColor: genre.color,
              background: `${genre.color}1E`,
              boxShadow: `0 0 28px ${genre.color}35, inset 0 0 28px ${genre.color}10`,
              transform: "scale(1.01)",
            }
          : undefined
      }
      aria-pressed={selected}
    >
      {/* Glow blob on selected */}
      {selected && (
        <div
          className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 40%, ${genre.color}, transparent 65%)`,
          }}
        />
      )}

      <div className="relative flex flex-col gap-2.5">
        {/* Icon */}
        <span
          className="text-3xl leading-none transition-all duration-250"
          style={{ color: selected ? genre.color : "#A8A8BC" }}
        >
          {genre.icon}
        </span>

        {/* Label + description */}
        <div>
          <p
            className="font-semibold text-sm transition-colors leading-snug"
            style={{ color: selected ? genre.color : "#EAEAF0" }}
          >
            {genre.label}
          </p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            {genre.description}
          </p>
        </div>

        {/* Subgenre tags */}
        {genre.subgenres && (
          <div className="flex flex-wrap gap-1">
            {genre.subgenres.slice(0, 2).map((sub) => (
              <span
                key={sub}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors"
                style={{
                  background: selected ? `${genre.color}18` : "rgba(255,255,255,0.05)",
                  color: selected ? `${genre.color}cc` : "#78788C",
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
