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
  label: string;
  range: string;
}

export interface GenerateRequest {
  genre: Genre;
  mood: Mood;
  tempo: Tempo;
  influences: Influence[];
  timeSignatures: TimeSignature[];
  chordVoicings: ChordVoicing[];
  textures: string[];
  sunoMode: boolean;
  promptLength: PromptLength;
}

export interface PromptHistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  params: {
    genre: string;
    mood: string;
    tempo: string;
    influences: string[];
    timeSignatures: string[];
    chordVoicings: string[];
    textures: string[];
    sunoMode: boolean;
    promptLength: PromptLength;
  };
}
