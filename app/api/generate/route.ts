import { NextRequest, NextResponse } from "next/server";
import { apiKeyMissing, missingKeyResponse, streamTextResponse } from "@/lib/anthropic";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompt-builder";
import { tempoForBpm, MIN_BPM, MAX_BPM } from "@/lib/knowledge-base";
import type { GenerateRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (apiKeyMissing()) return missingKeyResponse();

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { genre, mood, bpm, key, instruments, feel, avoid, influences, timeSignatures, chordVoicings, textures, sunoMode, promptLength, notes } = body;

  if (!genre || !mood || typeof bpm !== "number" || !Number.isFinite(bpm)) {
    return NextResponse.json(
      { error: "Missing required fields: genre, mood, and BPM are required." },
      { status: 400 }
    );
  }
  const clampedBpm = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));

  const length = promptLength ?? "standard";
  return streamTextResponse(
    {
      system: buildSystemPrompt(sunoMode, length),
      user: buildUserMessage({
        genre,
        mood,
        tempo: tempoForBpm(clampedBpm),
        bpm: clampedBpm,
        key: typeof key === "string" ? key : "",
        instruments: instruments ?? [],
        feel: feel ?? { energy: 50, warmth: 50, complexity: 50 },
        avoid: typeof avoid === "string" ? avoid.slice(0, 200) : undefined,
        influences: influences ?? [],
        timeSignatures: timeSignatures ?? [],
        chordVoicings: chordVoicings ?? [],
        textures: textures ?? [],
        sunoMode,
        promptLength: length,
        notes: typeof notes === "string" ? notes.slice(0, 600) : undefined,
      }),
    },
    req.signal
  );
}
