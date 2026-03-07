import type { GenerateRequest } from "./types";

export function buildSystemPrompt(sunoMode: boolean): string {
  const platformClause = sunoMode
    ? ", particularly Suno"
    : "";
  const platformRules = sunoMode
    ? "Optimize for Suno's style tags and natural language understanding. Suno responds well to genre tags, mood descriptors, instrument specifics, and production qualities."
    : "Write prompts that work across AI music platforms. Use natural language descriptions of genre, mood, instruments, and production style.";

  return `You are an expert AI music prompt engineer specializing in crafting prompts for AI music generation platforms${platformClause}. You have deep knowledge of music production, genre conventions, and what descriptors produce the best results.

RULES:
- Output ONLY the final prompt text. No explanations, no labels, no markdown.
- Keep prompts between 80-200 words — detailed but not overloaded.
- ${platformRules}
- NEVER use artist names directly. Instead, describe their sonic characteristics.
- Include human-imperfection descriptors when provided (fret slides, timing drift, etc.) — these make AI music sound more authentic and organic.
- When chord voicings are specified, weave them naturally into the prompt as harmonic color descriptions.
- Structure the prompt with a logical flow: genre/style → mood/atmosphere → instruments/arrangement → production quality → human details.
- Use evocative, specific language. "Shimmering clean guitars with slight chorus" beats "nice guitar sound."
- If odd time signatures are specified, describe them musically (e.g., "shifting between 7/8 and 4/4 with a natural lilt") rather than just stating the number.`;
}

export function buildUserMessage(req: GenerateRequest): string {
  const { genre, mood, tempo, influences, timeSig, chordVoicings, textures, sunoMode } = req;

  const lines: string[] = [
    `Generate a ${sunoMode ? "Suno-optimized" : "platform-agnostic"} AI music prompt with these parameters:`,
    "",
    `GENRE: ${genre.label} — ${genre.description}`,
  ];

  if (genre.subgenres && genre.subgenres.length > 0) {
    lines.push(`SUBGENRE TAGS: ${genre.subgenres.join(", ")}`);
  }

  lines.push(`MOOD: ${mood.label} — associated textures: ${mood.textures}`);
  lines.push(`TEMPO: ${tempo.range}`);

  if (influences.length > 0) {
    lines.push("");
    lines.push("SONIC INFLUENCES (describe these sonically, never by name):");
    for (const inf of influences) {
      lines.push(`- ${inf.sonic}`);
    }
  }

  if (timeSig && timeSig !== "4/4") {
    lines.push(`TIME SIGNATURE: ${timeSig}`);
  }

  if (chordVoicings.length > 0) {
    lines.push(`CHORD COLORS: ${chordVoicings.map((c) => c.label).join(", ")}`);
  }

  if (textures.length > 0) {
    lines.push(`HUMAN TEXTURE DETAILS: ${textures.join(", ")}`);
  }

  lines.push("");
  lines.push("Output ONLY the prompt text, nothing else.");

  return lines.join("\n");
}
