import type { Influence, PromptLength, Selection } from "./types";

/**
 * Round-trips a Selection through URL query params so a setup can be shared as a link.
 * Catalog picks are stored by id; custom influences carry their generated profile inline.
 */

const LENGTHS: PromptLength[] = ["concise", "standard", "detailed"];

export function encodeSelection(sel: Selection): string {
  const q = new URLSearchParams();
  if (sel.genreId) q.set("g", sel.genreId);
  if (sel.moodId) q.set("m", sel.moodId);
  if (sel.bpm) q.set("t", String(sel.bpm));
  if (sel.key) q.set("k", sel.key);
  if (sel.instrumentIds.length) q.set("in", sel.instrumentIds.join(","));
  if (sel.feel.energy !== 50) q.set("fe", String(sel.feel.energy));
  if (sel.feel.warmth !== 50) q.set("fw", String(sel.feel.warmth));
  if (sel.feel.complexity !== 50) q.set("fc", String(sel.feel.complexity));
  if (sel.avoid.trim()) q.set("av", sel.avoid.trim());
  if (sel.influenceIds.length) q.set("i", sel.influenceIds.join(","));
  if (sel.customInfluences.length) {
    q.set("ci", JSON.stringify(sel.customInfluences.map((c) => [c.label, c.sonic, c.genres])));
  }
  const sigs = sel.timeSignatureIds.filter((s) => s !== "4-4");
  if (sigs.length) q.set("ts", sigs.join(","));
  if (sel.chordVoicingIds.length) q.set("c", sel.chordVoicingIds.join(","));
  if (sel.textures.length) q.set("x", sel.textures.join("|"));
  if (sel.promptLength !== "standard") q.set("l", sel.promptLength);
  if (!sel.sunoMode) q.set("p", "any");
  if (sel.notes.trim()) q.set("n", sel.notes.trim());
  return q.toString();
}

function dial(q: URLSearchParams, key: string): number {
  const n = Number(q.get(key));
  return Number.isFinite(n) && q.get(key) !== null ? Math.min(100, Math.max(0, Math.round(n))) : 50;
}

function list(q: URLSearchParams, key: string, sep = ","): string[] {
  const raw = q.get(key);
  return raw ? raw.split(sep).map((s) => s.trim()).filter(Boolean) : [];
}

export function decodeSelection(search: string): Partial<Selection> | null {
  const q = new URLSearchParams(search);
  if (Array.from(q.keys()).length === 0) return null;

  let customInfluences: Influence[] = [];
  try {
    const raw = q.get("ci");
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customInfluences = parsed
          .filter((e): e is [string, string, string[]] => Array.isArray(e) && typeof e[0] === "string" && typeof e[1] === "string")
          .map(([label, sonic, genres]) => ({
            id: customInfluenceId(label),
            label,
            sonic,
            genres: Array.isArray(genres) ? genres : [],
            custom: true,
          }));
      }
    }
  } catch {
    customInfluences = [];
  }

  const length = q.get("l");
  const sigs = list(q, "ts");
  const bpmRaw = Number(q.get("t"));
  const bpm = Number.isFinite(bpmRaw) && bpmRaw >= 40 && bpmRaw <= 220 ? Math.round(bpmRaw) : null;

  return {
    genreId: q.get("g") ?? "",
    moodId: q.get("m") ?? "",
    bpm,
    key: q.get("k") ?? "",
    instrumentIds: list(q, "in"),
    feel: { energy: dial(q, "fe"), warmth: dial(q, "fw"), complexity: dial(q, "fc") },
    avoid: q.get("av") ?? "",
    influenceIds: [...list(q, "i"), ...customInfluences.map((c) => c.id)],
    customInfluences,
    timeSignatureIds: sigs.length ? sigs : ["4-4"],
    chordVoicingIds: list(q, "c"),
    textures: list(q, "x", "|"),
    promptLength: LENGTHS.includes(length as PromptLength) ? (length as PromptLength) : "standard",
    sunoMode: q.get("p") !== "any",
    notes: q.get("n") ?? "",
  };
}

export function customInfluenceId(label: string): string {
  return "custom-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
