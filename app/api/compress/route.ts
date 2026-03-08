import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { PromptLength } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TARGET_WORDS: Record<PromptLength, string> = {
  concise: "under 70 words",
  standard: "70-120 words",
  detailed: "120-180 words",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }

  let body: { prompt: string; promptLength: PromptLength };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, promptLength } = body;
  if (!prompt || !promptLength) {
    return NextResponse.json({ error: "Missing prompt or promptLength." }, { status: 400 });
  }

  const target = TARGET_WORDS[promptLength] ?? "70-120 words";

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: `You are an expert at condensing AI music generation prompts.
Shorten the given prompt to ${target} while preserving the most impactful descriptors — genre, mood, and key sonic textures.
Output ONLY the shortened prompt text. No explanations, no labels.`,
      messages: [{ role: "user", content: `Shorten this music prompt to ${target}:\n\n${prompt}` }],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError)
      return NextResponse.json({ error: `API error: ${error.message}` }, { status: error.status ?? 500 });
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
