export type GenreCategory =
  | "rock-alt"
  | "electronic"
  | "hip-hop-rnb"
  | "world-global"
  | "atmospheric"
  | "orchestral-jazz";

export type VoicingCategory =
  | "bright-open"
  | "dark-tense"
  | "groove-soul"
  | "jazz-modern"
  | "raw";

export type PromptLength = "concise" | "standard" | "detailed";

export interface Genre {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  subgenres?: string[];
  category: GenreCategory;
}

export interface Mood {
  id: string;
  label: string;
  textures: string;
  intensity: number;
}

export interface Influence {
  id: string;
  label: string;
  sonic: string;
  genres: string[];
  searchTerms?: string[];
  /** True when the profile was generated on the fly via /api/influence rather than curated. */
  custom?: boolean;
}

export interface TimeSignature {
  id: string;
  label: string;
  description: string;
}

export interface ChordVoicing {
  id: string;
  label: string;
  description: string;
  category: VoicingCategory;
}

export interface Tempo {
  id: string;
  label: string;
  range: string;
  /** Inclusive lower bound used to bucket an exact BPM into this range. */
  minBpm: number;
}

export interface Instrument {
  id: string;
  label: string;
}

export interface MusicalKey {
  id: string;
  label: string;
}

/** Three 0–100 dials that add feel descriptors on top of the mood. 50 = neutral (omitted). */
export interface Feel {
  energy: number;
  warmth: number;
  complexity: number;
}

export interface GenerateRequest {
  genre: Genre;
  mood: Mood;
  tempo: Tempo;
  bpm: number;
  /** "" means any key. */
  key: string;
  instruments: Instrument[];
  feel: Feel;
  /** Things the prompt should steer away from — "vocals, distortion, major key". */
  avoid?: string;
  influences: Influence[];
  timeSignatures: TimeSignature[];
  chordVoicings: ChordVoicing[];
  textures: string[];
  sunoMode: boolean;
  promptLength: PromptLength;
  /** Free-text notes from the "describe it" box — nuance the structured picks can't capture. */
  notes?: string;
}

export interface PromptHistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  params: {
    genre: string;
    mood: string;
    tempo: string;
    key?: string;
    instruments?: string[];
    influences: string[];
    timeSignatures: string[];
    chordVoicings: string[];
    textures: string[];
    sunoMode: boolean;
    promptLength: PromptLength;
  };
}

/** A full set of selections — what presets, share links, and the describe-it parser all produce. */
export interface Selection {
  genreId: string;
  moodId: string;
  /** Exact tempo; null until chosen. The knowledge-base tempo bucket is derived from it. */
  bpm: number | null;
  key: string;
  instrumentIds: string[];
  feel: Feel;
  avoid: string;
  influenceIds: string[];
  customInfluences: Influence[];
  timeSignatureIds: string[];
  chordVoicingIds: string[];
  textures: string[];
  promptLength: PromptLength;
  sunoMode: boolean;
  notes: string;
}

export interface Preset {
  id: string;
  label: string;
  tagline: string;
  selection: Omit<Selection, "customInfluences" | "sunoMode" | "notes" | "avoid" | "key"> & { key?: string; avoid?: string };
}

/** Everything the user has picked, minus the custom-influence library (which lives in localStorage). */
export type Picks = Omit<Selection, "customInfluences">;

/** A setup the user named and saved — everything except the custom-influence library. */
export interface UserPreset {
  id: string;
  name: string;
  createdAt: number;
  selection: Picks;
}

export interface SunoKitSection {
  tag: string;
  direction: string;
}

/** Everything else Suno's Custom mode asks for besides the style prompt. */
export interface SunoKit {
  titles: string[];
  excludeStyles: string[];
  structure: SunoKitSection[];
  hookIdea: string;
}
