import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, apiKeyMissing, missingKeyResponse, parseStructured } from "@/lib/anthropic";

/**
 * Suno Kit — everything Suno's Custom mode asks for besides the style prompt:
 * title options, an "Exclude Styles" list, and a bracket-tagged structure sheet for the lyrics field.
 */
const Kit = z.object({
  titles: z.array(z.string()).describe("Exactly 3 evocative song titles, 1-4 words each, no quotes"),
  excludeStyles: z.array(z.string()).describe("4-6 short style tags to steer AWAY from — genres, instruments, or production traits that would ruin this track (e.g. 'autotune', 'EDM drop', 'trap hi-hats')"),
  structure: z
    .array(
      z.object({
        tag: z.string().describe("Section name only, e.g. Intro, Verse 1, Build, Chorus, Bridge, Breakdown, Outro"),
        direction: z.string().describe("8-16 words of musical direction for the section: which instruments enter or leave, dynamics, meter changes"),
      })
    )
    .describe("5-7 sections in playing order"),
  hookIdea: z.string().describe("If vocal: one candidate lyric line for the hook (under 12 words). If instrumental: empty string."),
});

const SYSTEM = `You are an expert at Suno's Custom mode. Given a finished style prompt, produce the supporting pieces:
- titles: three short, evocative titles that match the mood (no genre names, no quotes).
- excludeStyles: what Suno should avoid so it doesn't drift — be specific to THIS track's risks.
- structure: section tags for Suno's lyrics field. For instrumental tracks, the direction describes the arrangement of that section (instruments, dynamics, meter). For vocal tracks, describe delivery and arrangement; the user will add lyrics under each tag.
- hookIdea: only for vocal tracks.
Use the prompt's own musical language; do not introduce new genres.`;

export async function POST(req: NextRequest) {
  if (apiKeyMissing()) return missingKeyResponse();

  let body: { prompt?: string; vocals?: boolean; avoid?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: "Generate a prompt first." }, { status: 400 });
  const vocals = body.vocals === true;
  const avoid = typeof body.avoid === "string" && body.avoid.trim() ? `\nUSER WANTS TO AVOID: ${body.avoid.trim().slice(0, 200)} — include these in excludeStyles.` : "";

  try {
    const kit = await parseStructured(
      {
        system: SYSTEM,
        user: `TRACK TYPE: ${vocals ? "vocal (has lyrics)" : "instrumental (no vocals)"}${avoid}\n\nSTYLE PROMPT:\n${prompt.slice(0, 3000)}`,
        schema: Kit,
        maxTokens: 1024,
      },
      req.signal
    );
    return NextResponse.json({
      ...kit,
      titles: kit.titles.slice(0, 3),
      excludeStyles: kit.excludeStyles.slice(0, 6),
      structure: kit.structure.slice(0, 7),
      hookIdea: vocals ? kit.hookIdea : "",
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
