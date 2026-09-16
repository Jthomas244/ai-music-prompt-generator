import type { Feel, GenerateRequest, PromptHistoryEntry, PromptLength } from "./types";
import { keyLabel } from "./knowledge-base";

export const WORD_TARGETS: Record<PromptLength, string> = {
  concise: "under 70 words",
  standard: "70-120 words",
  detailed: "120-180 words",
};

function lengthInstruction(promptLength: PromptLength): string {
  switch (promptLength) {
    case "concise":
      return "Keep the prompt under 70 words. Prioritize genre, mood, and one key texture. Be punchy.";
    case "detailed":
      return "Use 120-180 words. Elaborate on sonic textures, arrangement, production qualities, and human details.";
    case "standard":
    default:
      return "Keep the prompt between 70-120 words. Include all selected parameters with balanced detail.";
  }
}

function platformRules(sunoMode: boolean): string {
  return sunoMode
    ? `Optimize for Suno's "Style of Music" field. Suno responds well to genre tags, mood descriptors, instrument specifics, and production qualities. Never include section tags like [Verse] or [Chorus] — those belong in the lyrics field, not the style prompt.`
    : "Write prompts that work across AI music platforms. Use natural language descriptions of genre, mood, instruments, and production style.";
}

export function buildSystemPrompt(sunoMode: boolean, promptLength: PromptLength = "standard"): string {
  const platformClause = sunoMode ? ", particularly Suno" : "";

  return `You are an expert AI music prompt engineer specializing in crafting prompts for AI music generation platforms${platformClause}. You have deep knowledge of music production, genre conventions, and what descriptors produce the best results.

RULES:
- Output ONLY the final prompt text. No explanations, no labels, no markdown.
- ${lengthInstruction(promptLength)}
- ${platformRules(sunoMode)}
- NEVER use artist names directly. Instead, describe their sonic characteristics.
- Include human-imperfection descriptors when provided (fret slides, timing drift, etc.) — these make AI music sound more authentic and organic.
- When chord voicings are specified, weave them naturally into the prompt as harmonic color descriptions.
- Structure the prompt with a logical flow: genre/style → mood/atmosphere → instruments/arrangement → production quality → human details.
- Use evocative, specific language. "Shimmering clean guitars with slight chorus" beats "nice guitar sound."
- If multiple time signatures are specified, describe the interplay musically (e.g., "shifting between a driving 7/8 verse groove and an open 6/8 chorus feel") rather than just listing numbers.
- If the user supplied free-text notes, treat them as the highest-priority intent: honor specific requests (instruments, vocals vs. instrumental, references to a scene or use) even when they aren't covered by the structured parameters.`;
}

export const NEUTRAL_FEEL: Feel = { energy: 50, warmth: 50, complexity: 50 };

/** The three dials become prose only when the user has actually moved one off neutral. */
export function describeFeel(feel: Feel): string | null {
  if (feel.energy === 50 && feel.warmth === 50 && feel.complexity === 50) return null;
  const energy = feel.energy > 70 ? "driving and propulsive" : feel.energy > 40 ? "steady, mid-tempo momentum" : "restrained and spacious";
  const warmth = feel.warmth > 65 ? "warm, tape-saturated tone" : feel.warmth > 35 ? "balanced clarity" : "cool, glassy clarity";
  const complexity = feel.complexity > 70 ? "intricate, odd-metered interplay" : feel.complexity > 40 ? "melodic but structured" : "simple, repetitive figures";
  return `energy ${feel.energy}/100 (${energy}); warmth ${feel.warmth}/100 (${warmth}); complexity ${feel.complexity}/100 (${complexity})`;
}

export function buildUserMessage(req: GenerateRequest): string {
  const { genre, mood, tempo, bpm, key, instruments, feel, avoid, influences, timeSignatures, chordVoicings, textures, sunoMode, promptLength, notes } = req;

  const lines: string[] = [
    `Generate a ${sunoMode ? "Suno-optimized" : "platform-agnostic"} AI music prompt with these parameters:`,
    "",
    `GENRE: ${genre.label} — ${genre.description}`,
  ];

  if (genre.subgenres && genre.subgenres.length > 0) {
    lines.push(`SUBGENRE TAGS: ${genre.subgenres.join(", ")}`);
  }

  lines.push(`MOOD: ${mood.label} — associated textures: ${mood.textures}`);
  const feelText = describeFeel(feel);
  if (feelText) lines.push(`FEEL: ${feelText}`);
  lines.push(`TEMPO: ${bpm} BPM (${tempo.range} range)`);
  if (key) lines.push(`KEY: ${keyLabel(key) || key}`);
  if (instruments.length > 0) {
    lines.push(`INSTRUMENTATION: ${instruments.map((i) => i.label.toLowerCase()).join(", ")} — feature these; don't introduce lead instruments that aren't listed`);
  }

  if (influences.length > 0) {
    lines.push("");
    if (influences.length >= 4) {
      lines.push(`SONIC INFLUENCES — ${influences.length} influences selected, write a fusion prompt blending these sonics (never use names):`);
    } else {
      lines.push("SONIC INFLUENCES (describe these sonically, never by name):");
    }
    for (const inf of influences) {
      lines.push(`- ${inf.sonic}`);
    }
  }

  const nonStandardSigs = timeSignatures.filter((t) => t.id !== "4-4");
  if (nonStandardSigs.length > 0) {
    if (nonStandardSigs.length === 1) {
      lines.push(`TIME SIGNATURE: ${nonStandardSigs[0].label} — ${nonStandardSigs[0].description}`);
    } else {
      const sigLabels = nonStandardSigs.map((t) => t.label).join(" + ");
      lines.push(`TIME SIGNATURES: ${sigLabels} — describe the musical interplay between these meters`);
    }
  }

  if (chordVoicings.length > 0) {
    lines.push(`CHORD COLORS: ${chordVoicings.map((c) => c.label).join(", ")}`);
  }

  if (textures.length > 0) {
    lines.push(`HUMAN TEXTURE DETAILS: ${textures.join(", ")}`);
  }

  if (avoid && avoid.trim()) {
    lines.push(`AVOID: ${avoid.trim()} — steer clearly away from these; you may phrase the avoidance positively (e.g. "purely instrumental" for "vocals")`);
  }

  if (notes && notes.trim()) {
    lines.push("");
    lines.push(`USER NOTES (highest priority — honor these): ${notes.trim()}`);
  }

  lines.push(`PROMPT LENGTH TARGET: ${promptLength}`);
  lines.push("");
  lines.push("Output ONLY the prompt text, nothing else.");

  return lines.join("\n");
}

/**
 * What most people would type into Suno without help. Built from the snapshot of
 * parameters a prompt was generated with, so the comparison stays honest even after
 * the user changes selections underneath it.
 */
export function buildNaivePrompt(params: PromptHistoryEntry["params"]): string {
  const parts = [`${params.mood.split(" / ")[0].toLowerCase()} ${params.genre.toLowerCase()}`, params.tempo.toLowerCase()];
  if (params.key) parts.push(params.key);
  if (params.instruments?.length) parts.push(params.instruments.join(", ").toLowerCase());
  if (params.timeSignatures.length) parts.push(params.timeSignatures.join(" and "));
  if (params.influences.length) parts.push(`like ${params.influences.join(" and ")}`);
  return parts.join(", ");
}
