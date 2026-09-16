import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import type { z } from "zod";

/**
 * One place for everything that touches the Claude API.
 * Thinking stays off (omitted) on purpose — prompt writing is a taste task, and a short
 * time-to-first-token is what makes the streaming output feel live.
 */
export const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function apiKeyMissing(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !key || key === "your_key_here";
}

export function missingKeyResponse(): NextResponse {
  return NextResponse.json(
    { error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local." },
    { status: 500 }
  );
}

export class RefusalError extends Error {
  constructor() {
    super("The model declined this request. Try rephrasing.");
    this.name = "RefusalError";
  }
}

/** Map SDK errors to JSON responses — most specific first. */
export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof RefusalError)
    return NextResponse.json({ error: error.message }, { status: 422 });
  if (error instanceof Anthropic.AuthenticationError)
    return NextResponse.json({ error: "Invalid API key. Check ANTHROPIC_API_KEY in .env.local." }, { status: 401 });
  if (error instanceof Anthropic.RateLimitError)
    return NextResponse.json({ error: "Rate limit exceeded. Please wait a moment and try again." }, { status: 429 });
  if (error instanceof Anthropic.APIError)
    return NextResponse.json({ error: `API error: ${error.message}` }, { status: error.status ?? 500 });
  if (error instanceof Error && error.name === "AbortError")
    return NextResponse.json({ error: "Request cancelled." }, { status: 499 });
  return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
}

interface TextRequest {
  system: string;
  user: string;
  maxTokens?: number;
}

/**
 * Stream a text completion straight to the browser as plain text chunks.
 *
 * The first stream event is awaited before the Response is created so that auth, rate-limit,
 * and validation errors surface as proper HTTP error codes instead of a broken stream.
 */
export async function streamTextResponse(
  { system, user, maxTokens = 1024 }: TextRequest,
  signal?: AbortSignal
): Promise<Response> {
  const stream = getClient().messages.stream(
    {
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    },
    { signal }
  );

  const iterator = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    first = await iterator.next();
  } catch (error) {
    return apiErrorResponse(error);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let result = first;
        while (!result.done) {
          const event = result.value;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
          result = await iterator.next();
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

interface StructuredRequest<T extends z.ZodType> {
  /** Stable instructions — sent as a cached system block so repeat calls are cheap. */
  system: string;
  user: string;
  schema: T;
  maxTokens?: number;
}

/** Ask for JSON that matches a zod schema; the SDK validates it before we ever see it. */
export async function parseStructured<T extends z.ZodType>(
  { system, user, schema, maxTokens = 2048 }: StructuredRequest<T>,
  signal?: AbortSignal
): Promise<z.infer<T>> {
  const response = await getClient().messages.parse(
    {
      model: MODEL,
      max_tokens: maxTokens,
      output_config: { format: zodOutputFormat(schema) },
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
    },
    { signal }
  );

  if (response.stop_reason === "refusal") throw new RefusalError();
  if (!response.parsed_output) throw new Error("The model returned malformed output. Try again.");
  return response.parsed_output;
}
