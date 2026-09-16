[TONEPROMPTREADME.md](https://github.com/user-attachments/files/25820363/TONEPROMPTREADME.md)
# TonePrompt

**AI Music Prompt Generator** — Transform musical ideas into expert-level prompts for AI music platforms. Built with deep genre knowledge and production-aware prompt engineering.

**[Live Demo →](https://ai-music-prompt-generator.vercel.app)**

---

## What It Does

Most AI music prompts are vague — "make a chill guitar song" — and produce generic results. This tool fixes that.

Users select musical parameters through an interactive UI: genre, mood, tempo, sonic influences, time signatures, chord voicings, and human-texture descriptors. The app feeds those selections through a carefully crafted system prompt and curated knowledge base, then an LLM generates a detailed, evocative prompt optimized for platforms like Suno.

The difference between a naive prompt and an optimized one is dramatic. Instead of "relaxing math rock," you get a 100–150 word prompt describing tapped clean guitars with slight chorus, interlocking polyrhythmic patterns in 7/8, Lydian-colored harmonics over add9 voicings, analog tape warmth with fret slides and timing drift — the kind of specificity that actually produces interesting music.

**V4 adds the other half of the workflow — and a new interface:** a fixed 440px control panel beside a fluid output panel, warm near-black ground with two flat panel levels, coral and teal accents, Fraunces / IBM Plex type. No gradients, no glow; hierarchy comes from panel levels and spacing.

- **Describe the vibe** — type "chill math rock for studying, toe meets Nujabes, some 7/8, a little trumpet" and Claude fills every control below (structured outputs against the knowledge base's own ids): genre, mood, BPM, key, instrumentation, the feel dials, what to avoid. Artists it recognizes but that aren't in the catalog get profiled on the fly.
- **Instrumentation, BPM, key, feel, avoid** — instrument chips, an exact BPM (bucketed into the knowledge base's tempo ranges), an optional key, three Energy / Warmth / Complexity dials that only speak up when moved off neutral, and an "Avoid" field that steers the prompt away and seeds the Suno Kit's exclusions.
- **Presets** — ten curated starting points ("Calm Math Rock for Studying", "Dark Shoegaze Walls", "Late-Night Lo-Fi"…) plus your own: name the current setup, save it, it's a pill next to the curated ones.
- **Custom influences** — type any artist into the influence search; Claude writes a catalog-style sonic profile so their *sound*, never their name, reaches the prompt. Additions persist across visits.
- **Refine** — "darker", "swap the trumpet for a Rhodes", "instrumental only": one-line rewrites of the generated prompt, with undo. Shorten is the same mechanism with a length instruction.
- **Suno Kit** — everything else Suno's Custom mode asks for: three title options, an "Exclude Styles" list specific to the track's risks, and a bracket-tagged structure sheet for the lyrics field (instrumental or vocal).
- **vs. naive** — a side-by-side with what most people would have typed, so the tool's value is visible rather than implied.
- **Share links & history** — any setup encodes into a URL (custom influences included); prompt history survives reloads.

## Why I Built It

I've spent months crafting AI music prompts by hand, learning what descriptors platforms like Suno respond to and which ones produce flat results. This app encodes that knowledge into a system that anyone can use.

It's also a demonstration of applied prompt engineering — not just writing prompts, but building a structured methodology around them: mapping genres to sonic descriptors, translating artist influences into platform-safe characteristics, and layering human-imperfection details that make AI-generated music sound organic.

## How It Works

### Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  React Frontend (Next.js) — control panel | output panel       │
│  Vibe · Avoid · Presets · Genre · Mood + feel · Instruments ·  │
│  BPM/Key · Influences · Fine-tune → Generate → Refine → Kit    │
└──────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │          │
  /api/parse  /api/influence /api/generate /api/refine /api/kit
  (structured) (structured)  (streamed)   (streamed)  (structured)
       │          │          │          │          │
       └──────────┴──────────┴────┬─────┴──────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │ lib/anthropic.ts           │
                    │ one client, one model,     │
                    │ streamTextResponse() +     │
                    │ parseStructured() (zod)    │
                    └─────────────┬──────────────┘
                                  │
                          Anthropic Claude API
                            (claude-sonnet-4-6)
```

Text routes stream plain-text chunks straight to the browser; the first stream event is awaited server-side so auth and rate-limit failures come back as real HTTP errors instead of a broken stream. Structured routes use the SDK's `messages.parse` with zod schemas built from the knowledge base — the parser literally cannot return a genre id that doesn't exist. The catalog is sent as a cached system block so repeat parses are cheap.

### The Knowledge Base

This is the core IP of the app. It's not a generic genre list — it's a curated dataset mapping musical concepts to production-level descriptors:

- **Genres** — Each genre has associated subgenres, sonic characteristics, and a color used for dynamic UI theming. Covers math rock, shoegaze, dreampop, lo-fi, post-punk, bedroom pop, progressive house, nu-metal, J-rock, ambient, indie folk, and hyperpop.

- **Sonic Influences** — Artists are mapped to their sonic characteristics rather than their names (AI platforms don't reliably interpret artist names). For example, one influence maps to "clean tapped guitars, trumpet accents, sprawling reverb, bittersweet melodies in odd time." Each influence also has genre affinities for smart suggestions.

- **Mood → Texture Mappings** — Each mood carries associated production textures. "Melancholy" maps to tape hiss, reverb wash, and detuned chorus. "Aggressive" maps to clipped transients, distorted bass, and tight compression.

- **Human Texture Descriptors** — Details like fret slides, finger noise, timing drift, room mic bleed, pick scrapes, and ghost notes. These are the secret weapon — they make AI-generated music sound less sterile and more like a real performance.

- **Chord Voicings** — Harmonic color options (Lydian, Phrygian Dominant, half-diminished, maj7#11, etc.) with descriptions that the LLM weaves into the prompt as musical language, not theory jargon.

### The System Prompt

The LLM receives a system prompt that encodes prompt engineering best practices:

- Structure output as genre/style → mood/atmosphere → instruments/arrangement → production quality → human details
- Translate artist influences sonically without naming them
- Describe time signatures musically ("shifting between 7/8 and 4/4 with a natural lilt") rather than stating numbers
- Use evocative, specific language — "shimmering clean guitars with slight chorus" over "nice guitar sound"
- Keep prompts between 80–200 words

### Platform Modes

- **Suno-Optimized** (default) — Structures prompts for Suno's style tags and natural language understanding
- **Platform-Agnostic** — Broader descriptive language that works across AI music platforms

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS (tokens from the visual design spec) |
| Type | Fraunces · IBM Plex Sans · IBM Plex Mono |
| Validation | Zod (structured outputs) |
| LLM | Anthropic Claude API (`claude-sonnet-4-6`) |
| Deployment | Vercel |

## Features

### Current (V4)
- Two-panel layout: fixed control panel (scrolls internally) beside the output
- Describe-the-vibe intake — free text → every control, via structured outputs
- Ten curated presets + user-saved presets
- Genre, mood, feel dials (energy / warmth / complexity), instrumentation, BPM, key, avoid
- Influence selection with genre-aware recommendations
- Custom influence lookup for any artist, persisted locally
- Advanced parameters (time signatures, chord voicings, human textures)
- Suno-optimized and platform-agnostic modes; concise / standard / detailed length
- Streaming generation with word-count guardrails
- Refine with one-line instructions (+ undo), Shorten
- Suno Kit: titles, exclude-styles, structure tags (instrumental or vocal)
- Naive-vs-optimized comparison
- Shareable setup links; prompt history that survives reloads
- Fully responsive (stacked below 1024px with a fixed action bar), reduced-motion aware

### Version history
| Version | What changed |
|---------|--------------|
| V1 | Proof of concept — genre/mood/tempo/influences → Claude → prompt |
| V2 | Expanded genres, influence search, multi-meter time signatures, chord voicings, textures, prompt length, compress |
| V3 | Motion, responsiveness, atmospheric design overhaul |
| V4 | Describe-it parser, presets (curated + saved), custom influences, refine, Suno Kit, share links, persistent history, shared API layer; new two-panel visual design with instrumentation, BPM/key, feel dials, and avoid |

### Ideas for later
- Multiple variations side-by-side (A/B)
- Section-level prompts (different descriptors per verse/chorus)
- Export a kit as a single Suno-ready text file

## Getting Started

### Prerequisites
- Node.js 18+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/toneprompt.git
cd toneprompt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your API key from [console.anthropic.com](https://console.anthropic.com). Starts with `sk-ant-api03-` |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate/       # Selections → streamed style prompt
│   │   ├── refine/         # Prompt + instruction → streamed rewrite (Shorten uses this too)
│   │   ├── parse/          # Free text → structured selections
│   │   ├── influence/      # Artist name → sonic profile
│   │   └── kit/            # Prompt → titles, exclude styles, structure tags
│   ├── page.tsx            # Main app page (single selection state)
│   └── layout.tsx          # Root layout with fonts and metadata
├── components/
│   ├── ControlPanel.tsx    # Left panel: vibe, avoid, presets, genre, mood + feel, instruments, BPM/key…
│   ├── OutputPanel.tsx     # Right panel: output card, refine, meta row, kit, recents
│   ├── InfluenceSearch.tsx # Influence search with custom-artist lookup
│   ├── FineTune.tsx        # Collapsible time signatures / chord color / textures
│   ├── SunoKitPanel.tsx    # Titles / exclude styles / structure
│   ├── RecentRow.tsx       # Horizontal row of recent prompts
│   ├── MobileBottomBar.tsx # Fixed action bar below the lg breakpoint
│   └── ui.tsx              # Label, Chip, Slider, Logo, Waveform primitives
├── lib/
│   ├── anthropic.ts        # Shared Claude client, streaming + structured helpers
│   ├── knowledge-base.ts   # All curated musical data (+ instruments, keys, BPM buckets)
│   ├── catalog.ts          # Id lists + text catalog for the parser
│   ├── presets.ts          # One-click starting points
│   ├── prompt-builder.ts   # System prompt, user message, naive comparison
│   ├── share.ts            # Selection ↔ URL codec
│   ├── storage.ts          # localStorage hook
│   └── types.ts            # TypeScript interfaces
└── .env.example            # Environment variable template
```

## About the Author

**Julian Thomas** — Brooklyn, NY

Operations specialist with 6+ years in e-commerce (Shopify, Etsy, TikTok Shop, NetSuite, Deposco) now building AI-powered tools. This project combines deep music knowledge — spanning math rock, shoegaze, dreampop, lo-fi, J-rock, and progressive house — with applied prompt engineering and full-stack development.

- Email: JThomas244@proton.me
- LinkedIn: [linkedin.com/in/jt338](https://www.linkedin.com/in/jt338)

## License

MIT
