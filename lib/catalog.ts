import {
  GENRES,
  MOODS,
  TEMPOS,
  INFLUENCES,
  TIME_SIGNATURES,
  CHORD_VOICINGS,
  TEXTURES,
  INSTRUMENTS,
  KEYS,
} from "./knowledge-base";

/**
 * ID lists and a plain-text catalog of the knowledge base — the vocabulary the
 * describe-it parser is allowed to choose from. Kept separate from the UI data so the
 * API routes can build zod enums without dragging component code into the server bundle.
 */

function ids<T extends { id: string }>(items: T[]): [string, ...string[]] {
  const list = items.map((i) => i.id);
  return [list[0], ...list.slice(1)];
}

export const GENRE_IDS = ids(GENRES);
export const MOOD_IDS = ids(MOODS);
export const INSTRUMENT_IDS = ids(INSTRUMENTS);
export const KEY_IDS: [string, ...string[]] = ["any", ...KEYS.map((k) => k.id)];
export const INFLUENCE_IDS = ids(INFLUENCES);
export const TIME_SIGNATURE_IDS = ids(TIME_SIGNATURES);
export const CHORD_VOICING_IDS = ids(CHORD_VOICINGS);
export const TEXTURE_NAMES: [string, ...string[]] = [TEXTURES[0], ...TEXTURES.slice(1)];

export const CATALOG_TEXT = [
  "GENRES (id — label: description):",
  ...GENRES.map((g) => `- ${g.id} — ${g.label}: ${g.description}${g.subgenres ? ` (${g.subgenres.join(", ")})` : ""}`),
  "",
  "MOODS (id — label):",
  ...MOODS.map((m) => `- ${m.id} — ${m.label}`),
  "",
  "TEMPO RANGES (for reference when estimating BPM):",
  ...TEMPOS.map((t) => `- ${t.label}`),
  "",
  "INSTRUMENTS (id — label):",
  ...INSTRUMENTS.map((i) => `- ${i.id} — ${i.label}`),
  "",
  "KEYS (id — label; use \"any\" when unspecified):",
  ...KEYS.map((k) => `- ${k.id} — ${k.label}`),
  "",
  "INFLUENCES (id — artist: sound):",
  ...INFLUENCES.map((i) => `- ${i.id} — ${i.label}: ${i.sonic}`),
  "",
  "TIME SIGNATURES (id — label):",
  ...TIME_SIGNATURES.map((t) => `- ${t.id} — ${t.label}: ${t.description}`),
  "",
  "CHORD VOICINGS (id — label: description):",
  ...CHORD_VOICINGS.map((c) => `- ${c.id} — ${c.label}: ${c.description}`),
  "",
  "HUMAN TEXTURES (use the exact strings):",
  ...TEXTURES.map((t) => `- ${t}`),
].join("\n");
