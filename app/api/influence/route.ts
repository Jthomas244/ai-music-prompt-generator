import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, apiKeyMissing, missingKeyResponse, parseStructured } from "@/lib/anthropic";
import { GENRE_IDS } from "@/lib/catalog";
import { GENRES } from "@/lib/knowledge-base";

/**
 * Custom influence lookup: any artist → a catalog-style sonic profile.
 * The profile is what reaches the prompt generator; the artist's name never does.
 */
const InfluenceProfile = z.object({
  known: z.boolean().describe("false if you cannot confidently identify this artist or act"),
  label: z.string().describe("The artist's name as commonly written (fix casing/spelling)"),
  sonic: z.string().describe("25-40 words describing their sound: instruments, production, rhythm, vocal approach. Never mention artist or band names."),
  genres: z.array(z.enum(GENRE_IDS)).describe("1-3 catalog genres this artist is closest to"),
  searchTerms: z.array(z.string()).describe("3-6 lowercase terms: aliases, key albums, scene words"),
});

const SYSTEM = `You write sonic profiles for musical artists so an AI music prompt can channel their sound without naming them.
Be concrete and production-aware — name instruments, effects, mix character, rhythmic feel, and vocal delivery. Avoid vague adjectives and never include any artist or band name inside the profile.
If the input is not a real, identifiable artist (or you aren't confident), set known=false and keep the other fields brief.

CATALOG GENRE IDS:
${GENRES.map((g) => `- ${g.id} — ${g.label}: ${g.description}`).join("\n")}`;

export async function POST(req: NextRequest) {
  if (apiKeyMissing()) return missingKeyResponse();

  let body: { name?: string; genreId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Enter an artist name." }, { status: 400 });

  const context = body.genreId ? `\n(The user is currently working in the "${body.genreId}" genre.)` : "";

  try {
    const profile = await parseStructured(
      { system: SYSTEM, user: `ARTIST: ${name.slice(0, 80)}${context}`, schema: InfluenceProfile, maxTokens: 512 },
      req.signal
    );
    if (!profile.known) {
      return NextResponse.json(
        { error: `Couldn't confidently identify "${name}". Try the full name or a different spelling.` },
        { status: 404 }
      );
    }
    return NextResponse.json(profile);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
