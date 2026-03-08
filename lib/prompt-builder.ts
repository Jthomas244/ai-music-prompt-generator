import type { GenerateRequest, PromptLength } from "./types";

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

export function buildSystemPrompt(sunoMode: boolean, promptLength: PromptLength = "standard"): string {
  const platformClause = sunoMode ? ", particularly Suno" : "";
  const platformRules = sunoMode
    ? "Optimize for Suno's style tags and natural language understanding. Suno responds well to genre tags, mood descriptors, instrument specifics, and production qualities."
    : "Write prompts that work across AI music platforms. Use natural language descriptions of genre, mood, instruments, and production style.";

  return `You are an expert AI music prompt engineer specializing in crafting prompts for AI music generation platforms${platformClause}. You have deep knowledge of music production, genre conventions, and what descriptors produce the best results.

RULES:
- Output ONLY the final prompt text. No explanations, no labels, no markdown.
- ${lengthInstruction(promptLength)}
- ${platformRules}
- NEVER use artist names directly. Instead, describe their sonic characteristics.
- Include human-imperfection descriptors when provided (fret slides, timing drift, etc.) — these make AI music sound more authentic and organic.
- When chord voicings are specified, weave them naturally into the prompt as harmonic color descriptions.
- Structure the prompt with a logical flow: genre/style → mood/atmosphere → instruments/arrangement → production quality → human details.
- Use evocative, specific language. "Shimmering clean guitars with slight chorus" beats "nice guitar sound."
- If multiple time signatures are specified, describe the interplay musically (e.g., "shifting between a driving 7/8 verse groove and an open 6/8 chorus feel") rather than just listing numbers.`;
}

export function buildUserMessage(req: GenerateRequest): string {
  const { genre, mood, tempo, influences, timeSignatures, chordVoicings, textures, sunoMode, promptLength } = req;

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

  lines.push(`PROMPT LENGTH TARGET: ${promptLength}`);
  lines.push("");
  lines.push("Output ONLY the prompt text, nothing else.");

  return lines.join("\n");
}
