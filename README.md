[TONEPROMPTREADME.md](https://github.com/user-attachments/files/25820363/TONEPROMPTREADME.md)
# TonePrompt

**AI Music Prompt Generator** — Transform musical ideas into expert-level prompts for AI music platforms. Built with deep genre knowledge and production-aware prompt engineering.

**[Live Demo →](https://ai-music-prompt-generator.vercel.app)**

---

## What It Does

Most AI music prompts are vague — "make a chill guitar song" — and produce generic results. This tool fixes that.

Users select musical parameters through an interactive UI: genre, mood, tempo, sonic influences, time signatures, chord voicings, and human-texture descriptors. The app feeds those selections through a carefully crafted system prompt and curated knowledge base, then an LLM generates a detailed, evocative prompt optimized for platforms like Suno.

The difference between a naive prompt and an optimized one is dramatic. Instead of "relaxing math rock," you get a 100–150 word prompt describing tapped clean guitars with slight chorus, interlocking polyrhythmic patterns in 7/8, Lydian-colored harmonics over add9 voicings, analog tape warmth with fret slides and timing drift — the kind of specificity that actually produces interesting music.

## Why I Built It

I've spent months crafting AI music prompts by hand, learning what descriptors platforms like Suno respond to and which ones produce flat results. This app encodes that knowledge into a system that anyone can use.

It's also a demonstration of applied prompt engineering — not just writing prompts, but building a structured methodology around them: mapping genres to sonic descriptors, translating artist influences into platform-safe characteristics, and layering human-imperfection details that make AI-generated music sound organic.

## How It Works

### Architecture

```
┌──────────────────────────────────────────────────┐
│  React Frontend (Next.js)                        │
│  Genre → Mood → Tempo → Influences → Advanced    │
└──────────────┬───────────────────────────────────┘
               │ POST /api/generate
               ▼
┌──────────────────────────────────────────────────┐
│  API Route (server-side)                         │
│  ┌────────────────┐  ┌───────────────────────┐   │
│  │ Knowledge Base  │  │ Prompt Builder        │   │
│  │ Genres, moods,  │→ │ System prompt +       │   │
│  │ influences,     │  │ user message from     │   │
│  │ textures, chords│  │ selections            │   │
│  └────────────────┘  └───────────┬───────────┘   │
└──────────────────────────────────┼───────────────┘
                                   │
                                   ▼
                          Anthropic Claude API
                                   │
                                   ▼
                        Generated music prompt
```

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
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (customized) |
| LLM | Anthropic Claude API |
| Deployment | Vercel |

## Features

### Current (MVP)
- Interactive genre, mood, tempo, and influence selection
- Advanced parameters panel (time signatures, chord voicings, human textures)
- Suno-optimized and platform-agnostic modes
- LLM-powered prompt generation
- Copy and regenerate functionality
- Dynamic genre-colored UI theming
- Fully responsive design

### Planned
- Smart influence suggestions based on genre affinity
- Session-based prompt history
- Before/after comparison (naive vs. optimized prompt)
- Preset combos ("Calm Math Rock for Studying", "Dark Shoegaze Walls")
- Prompt length control
- Custom influence input via LLM lookup

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
│   ├── api/generate/      # Server-side API route for Claude calls
│   ├── page.tsx            # Main app page
│   └── layout.tsx          # Root layout with fonts and metadata
├── components/
│   ├── GenreCard.tsx       # Genre selection cards
│   ├── ChipSelector.tsx    # Reusable chip/tag selector
│   ├── AdvancedPanel.tsx   # Collapsible advanced parameters
│   ├── PromptOutput.tsx    # Output display with copy/regenerate
│   └── PlatformToggle.tsx  # Suno vs. platform-agnostic toggle
├── lib/
│   ├── knowledge-base.ts   # All curated musical data
│   ├── prompt-builder.ts   # System prompt and message construction
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
