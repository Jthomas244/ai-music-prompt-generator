export interface Genre {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  subgenres?: string[];
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
}

export interface ChordVoicing {
  id: string;
  label: string;
  description: string;
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
  timeSig: string;
  chordVoicings: ChordVoicing[];
  textures: string[];
  sunoMode: boolean;
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
    timeSig: string;
    chordVoicings: string[];
    textures: string[];
    sunoMode: boolean;
  };
}
