"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Genre } from "@/lib/types";

interface GenreCardProps {
  genre: Genre;
  selected: boolean;
  onSelect: (genre: Genre) => void;
}

export function GenreCard({ genre, selected, onSelect }: GenreCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={() => onSelect(genre)}
      aria-pressed={selected}
      className="relative w-full text-left rounded-2xl border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 overflow-hidden"
      style={{
        padding: "1.25rem",
        borderColor: selected ? genre.color : "rgba(255,255,255,0.08)",
        background: selected ? `${genre.color}1E` : "rgba(255,255,255,0.03)",
        boxShadow: selected
          ? `0 0 28px ${genre.color}35, inset 0 0 28px ${genre.color}10`
          : "none",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
      }}
      /* Scale and hover */
      animate={{ scale: selected ? 1.015 : 1 }}
      whileHover={prefersReducedMotion ? undefined : { scale: selected ? 1.025 : 1.03 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.965 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      /* Variant propagation for child icon tilt */
      variants={{ hovered: {} }}
    >
      {/* Glow blob behind content when selected */}
      {selected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 40%, ${genre.color}22, transparent 65%)`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative flex flex-col gap-2.5">
        {/* Icon with slight tilt on hover */}
        <motion.span
          className="text-3xl leading-none"
          style={{ color: selected ? genre.color : "#A8A8BC", display: "block" }}
          animate={{ rotate: 0 }}
          whileHover={prefersReducedMotion ? undefined : { rotate: 4, scale: 1.12 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          {genre.icon}
        </motion.span>

        {/* Label + description */}
        <div>
          <p
            className="font-semibold text-sm leading-snug"
            style={{
              color: selected ? genre.color : "#EAEAF0",
              transition: "color 0.25s ease",
            }}
          >
            {genre.label}
          </p>
          <p className="text-xs text-muted mt-1 leading-relaxed">{genre.description}</p>
        </div>

        {/* Subgenre tags */}
        {genre.subgenres && (
          <div className="flex flex-wrap gap-1">
            {genre.subgenres.slice(0, 2).map((sub) => (
              <span
                key={sub}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: selected ? `${genre.color}18` : "rgba(255,255,255,0.05)",
                  color: selected ? `${genre.color}cc` : "#78788C",
                  transition: "background 0.25s ease, color 0.25s ease",
                }}
              >
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}
