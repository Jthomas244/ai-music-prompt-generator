import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, apiKeyMissing, missingKeyResponse, parseStructured } from "@/lib/anthropic";
import {
  CATALOG_TEXT,
  CHORD_VOICING_IDS,
  GENRE_IDS,
  INFLUENCE_IDS,
  INSTRUMENT_IDS,
  KEY_IDS,
  MOOD_IDS,
  TEXTURE_NAMES,
  TIME_SIGNATURE_IDS,
} from "@/lib/catalog";

/**
 * "Describe it in words" → structured selections.
 * Claude maps free text onto the knowledge base's ids; artists it recognizes but that aren't
 * in the catalog come back as custom influences with a generated sonic profile.
 */
const ParsedSelection = z.object({
  genreId: z.enum(GENRE_IDS),
  moodId: z.enum(MOOD_IDS),
  bpm: z.number().int().describe("Estimated tempo in BPM, 40-220. Use the genre's typical tempo when the description doesn't say."),
  key: z.enum(KEY_IDS).describe("Musical key if the description implies one, else \"any\"."),
  instrumentIds: z.array(z.enum(INSTRUMENT_IDS)).describe("Instruments the description names or clearly implies. Empty if none. Max 6."),
  energy: z.number().int().describe("0-100. 50 = unspecified. High = driving/propulsive, low = restrained/spacious."),
  warmth: z.number().int().describe("0-100. 50 = unspecified. High = warm/tape-saturated, low = cool/glassy."),
  complexity: z.number().int().describe("0-100. 50 = unspecified. High = intricate/odd-metered, low = simple/repetitive."),
  avoid: z.string().describe("Comma-separated things the user said to avoid (e.g. 'vocals, distortion'). Empty string if none."),
  influenceIds: z.array(z.enum(INFLUENCE_IDS)).describe("Catalog influences the description points to. Max 5."),
  customInfluences: z
    .array(
      z.object({
        label: z.string().describe("Artist name as commonly written"),
        sonic: z.string().describe("25-40 words on their sound: instruments, production, feel. No artist names."),
        genres: z.array(z.enum(GENRE_IDS)).describe("1-3 catalog genres this artist is closest to"),
      })
    )
    .describe("Artists the user mentioned that are NOT in the catalog. Empty if none. Max 3."),
  timeSignatureIds: z.array(z.enum(TIME_SIGNATURE_IDS)).describe("Only when the description implies meter. Use [\"4-4\"] if unspecified."),
  chordVoicingIds: z.array(z.enum(CHORD_VOICING_IDS)).describe("0-2 voicings implied by the harmonic feel. Empty if unclear."),
  textures: z.array(z.enum(TEXTURE_NAMES)).describe("0-4 human textures implied by the description, exact strings."),
  promptLength: z.enum(["concise", "standard", "detailed"]),
  note: z.string().describe("One short sentence telling the user how you read their description, e.g. 'Read this as focused math rock in 7/8 with toe and Nujabes as anchors.'"),
});

const SYSTEM = `You translate a plain-English description of music into selections from a fixed catalog.
Choose the single closest genre and mood, and estimate a BPM.
Leave the three feel dials at 50 unless the description clearly pushes them ("driving" → high energy, "glassy" → low warmth, "simple loop" → low complexity). Pick catalog influences when the description names them or clearly evokes them (max 5 total across catalog + custom).
If the user names an artist who is NOT in the catalog, add them under customInfluences with an honest 25-40 word sonic profile — real, specific production language, no artist names inside the profile. If you don't recognize an artist, leave them out rather than invent a profile.
Only choose time signatures, chord voicings, and textures that the description actually implies; leave those arrays sparse rather than guessing.
Use promptLength "detailed" when the user gives lots of specifics, "concise" when they ask for something simple or short, else "standard".

${CATALOG_TEXT}`;

export async function POST(req: NextRequest) {
  if (apiKeyMissing()) return missingKeyResponse();

  let body: { description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const description = body.description?.trim();
  if (!description) return NextResponse.json({ error: "Describe the music first." }, { status: 400 });

  try {
    const parsed = await parseStructured(
      { system: SYSTEM, user: `DESCRIPTION:\n${description.slice(0, 800)}`, schema: ParsedSelection },
      req.signal
    );
    const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));
    return NextResponse.json({
      ...parsed,
      bpm: clamp(parsed.bpm, 40, 220),
      key: parsed.key === "any" ? "" : parsed.key,
      instrumentIds: parsed.instrumentIds.slice(0, 6),
      energy: clamp(parsed.energy, 0, 100),
      warmth: clamp(parsed.warmth, 0, 100),
      complexity: clamp(parsed.complexity, 0, 100),
      influenceIds: parsed.influenceIds.slice(0, 5),
      customInfluences: parsed.customInfluences.slice(0, 3),
      timeSignatureIds: parsed.timeSignatureIds.length ? parsed.timeSignatureIds : ["4-4"],
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
