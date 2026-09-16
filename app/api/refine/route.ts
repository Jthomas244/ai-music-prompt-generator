import { NextRequest, NextResponse } from "next/server";
import { apiKeyMissing, missingKeyResponse, streamTextResponse } from "@/lib/anthropic";
import { WORD_TARGETS } from "@/lib/prompt-builder";
import type { PromptLength } from "@/lib/types";

interface RefineBody {
  prompt: string;
  instruction: string;
  promptLength: PromptLength;
  sunoMode: boolean;
}

/**
 * Rewrites an existing prompt under a one-line instruction ("make it darker", "add trumpet",
 * "shorten it"). Compress is just a refine with a length instruction.
 */
export async function POST(req: NextRequest) {
  if (apiKeyMissing()) return missingKeyResponse();

  let body: RefineBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, instruction, promptLength, sunoMode } = body;
  if (!prompt?.trim() || !instruction?.trim()) {
    return NextResponse.json({ error: "Missing prompt or instruction." }, { status: 400 });
  }

  const target = WORD_TARGETS[promptLength] ?? WORD_TARGETS.standard;
  const platform = sunoMode ? "Suno's style field" : "AI music platforms";

  return streamTextResponse(
    {
      system: `You are an expert AI music prompt engineer editing a prompt for ${platform}.
Apply the user's instruction to the existing prompt. Keep everything the instruction doesn't touch — genre, mood, tempo, and the specific textures already there.
Stay within ${target} unless the instruction is about length.
Never use artist names; describe sound instead. Never include section tags like [Verse].
Output ONLY the revised prompt text. No explanations, no labels, no quotes.`,
      user: `INSTRUCTION: ${instruction.trim().slice(0, 300)}\n\nCURRENT PROMPT:\n${prompt.trim().slice(0, 3000)}`,
    },
    req.signal
  );
}
