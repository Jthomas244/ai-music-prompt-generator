import type { Genre, Mood, Influence, ChordVoicing, Tempo, TimeSignature, GenreCategory, VoicingCategory } from "./types";

// ─── Genre Category Labels ────────────────────────────────────────────────────

export const GENRE_CATEGORIES: { id: GenreCategory; label: string }[] = [
  { id: "rock-alt",       label: "Rock & Alternative" },
  { id: "electronic",     label: "Electronic & Dance" },
  { id: "hip-hop-rnb",   label: "Hip-Hop & R&B" },
  { id: "world-global",  label: "World & Global" },
  { id: "atmospheric",   label: "Atmospheric" },
  { id: "orchestral-jazz", label: "Orchestral & Jazz" },
];

// ─── Genres ───────────────────────────────────────────────────────────────────

export const GENRES: Genre[] = [
  // Rock & Alternative
  {
    id: "math-rock",
    label: "Math Rock",
    icon: "◇",
    description: "Tapping, odd meters, interlocking guitars",
    color: "#E8453C",
    subgenres: ["midwest emo", "post-rock", "twinkle"],
    category: "rock-alt",
  },
  {
    id: "shoegaze",
    label: "Shoegaze",
    icon: "◎",
    description: "Wall of sound, heavy reverb, buried vocals",
    color: "#8B5CF6",
    subgenres: ["noise pop", "dream noise", "ethereal"],
    category: "rock-alt",
  },
  {
    id: "post-punk",
    label: "Post-Punk",
    icon: "▣",
    description: "Angular guitars, driving bass, cold atmosphere",
    color: "#6B7280",
    subgenres: ["darkwave", "cold wave", "gothic rock"],
    category: "rock-alt",
  },
  {
    id: "garage-rock",
    label: "Garage Rock",
    icon: "⬢",
    description: "Raw, lo-fi, distorted, high-energy simplicity",
    color: "#8B4513",
    subgenres: ["proto-punk", "surf punk", "fuzz rock"],
    category: "rock-alt",
  },
  {
    id: "nu-metal",
    label: "Nu-Metal",
    icon: "⬡",
    description: "Downtuned riffs, aggressive, dynamic shifts",
    color: "#64748B",
    subgenres: ["alt-metal", "rap-metal", "heavy alternative"],
    category: "rock-alt",
  },
  {
    id: "midwest-emo",
    label: "Midwest Emo",
    icon: "✧",
    description: "Twinkly guitars, confessional, dynamic quiet-loud",
    color: "#E07A5F",
    subgenres: ["emo revival", "screamo-adjacent", "emo-folk"],
    category: "rock-alt",
  },
  // Electronic & Dance
  {
    id: "prog-house",
    label: "Progressive House",
    icon: "△",
    description: "Building layers, trance pads, euphoric drops",
    color: "#10B981",
    subgenres: ["melodic house", "progressive trance", "deep house"],
    category: "electronic",
  },
  {
    id: "synthwave",
    label: "Synthwave",
    icon: "▲",
    description: "Retro 80s synths, neon atmosphere, driving pulse",
    color: "#FF1493",
    subgenres: ["outrun", "darksynth", "retrowave", "vaporwave"],
    category: "electronic",
  },
  {
    id: "dnb",
    label: "Drum & Bass",
    icon: "⏃",
    description: "170+ BPM breaks, sub-bass, chopped percussion",
    color: "#7B68EE",
    subgenres: ["liquid DnB", "neurofunk", "jungle", "halftime"],
    category: "electronic",
  },
  {
    id: "hyperpop",
    label: "Hyperpop",
    icon: "✦",
    description: "Maximalist, pitch-shifted, glitchy, chaotic energy",
    color: "#D946EF",
    subgenres: ["glitchcore", "digicore", "bubblegum bass"],
    category: "electronic",
  },
  {
    id: "phonk",
    label: "Phonk",
    icon: "☠",
    description: "Memphis rap samples, cowbell, drift aesthetic",
    color: "#9CA3AF",
    subgenres: ["drift phonk", "Brazilian phonk", "house phonk"],
    category: "electronic",
  },
  // Hip-Hop & R&B
  {
    id: "hip-hop",
    label: "Hip-Hop",
    icon: "◆",
    description: "Boom-bap, trap, lyrical, sample-driven",
    color: "#FFD700",
    subgenres: ["boom-bap", "trap", "conscious", "jazz-rap", "abstract hip-hop"],
    category: "hip-hop-rnb",
  },
  {
    id: "rnb",
    label: "R&B / Neo-Soul",
    icon: "♫",
    description: "Silky vocals, lush harmonies, groove-driven",
    color: "#C084FC",
    subgenres: ["neo-soul", "alternative R&B", "PBR&B", "quiet storm"],
    category: "hip-hop-rnb",
  },
  {
    id: "funk",
    label: "Funk",
    icon: "⚡",
    description: "Syncopated bass, tight horns, rhythmic pocket",
    color: "#FF4500",
    subgenres: ["p-funk", "electro-funk", "acid funk", "go-go"],
    category: "hip-hop-rnb",
  },
  // World & Global
  {
    id: "j-rock",
    label: "J-Rock",
    icon: "⊕",
    description: "Melodic Japanese rock, visual kei influence, dramatic dynamics",
    color: "#FF6B35",
    subgenres: ["visual kei", "Japanese alternative", "anime rock"],
    category: "world-global",
  },
  {
    id: "afrobeats",
    label: "Afrobeats",
    icon: "◉",
    description: "West African rhythm, call-response, log drums",
    color: "#228B22",
    subgenres: ["afropop", "amapiano", "afro-fusion", "highlife"],
    category: "world-global",
  },
  {
    id: "reggaeton",
    label: "Reggaeton / Latin",
    icon: "♦",
    description: "Dembow rhythm, perreo bass, tropical energy",
    color: "#00CED1",
    subgenres: ["dembow", "Latin trap", "moombahton", "reggaeton romántico"],
    category: "world-global",
  },
  // Atmospheric
  {
    id: "dreampop",
    label: "Dreampop",
    icon: "◌",
    description: "Ethereal, lush pads, airy vocals",
    color: "#06B6D4",
    subgenres: ["ethereal wave", "ambient pop", "chillwave"],
    category: "atmospheric",
  },
  {
    id: "ambient",
    label: "Ambient",
    icon: "∞",
    description: "Textural soundscapes, evolving pads, no rhythm",
    color: "#3B82F6",
    subgenres: ["dark ambient", "drone", "ambient electronic"],
    category: "atmospheric",
  },
  {
    id: "lofi",
    label: "Lo-Fi",
    icon: "◈",
    description: "Tape warmth, vinyl crackle, mellow keys",
    color: "#F59E0B",
    subgenres: ["lo-fi hip hop", "chillhop", "study beats"],
    category: "atmospheric",
  },
  {
    id: "bedroom-pop",
    label: "Bedroom Pop",
    icon: "♡",
    description: "Intimate, slightly detuned, confessional",
    color: "#EC4899",
    subgenres: ["indie pop", "DIY pop", "soft indie"],
    category: "atmospheric",
  },
  // Orchestral & Jazz
  {
    id: "jazz",
    label: "Jazz",
    icon: "♪",
    description: "Improvisation, complex harmony, swing feel",
    color: "#B8860B",
    subgenres: ["bebop", "modal jazz", "fusion", "cool jazz", "free jazz"],
    category: "orchestral-jazz",
  },
  {
    id: "classical-crossover",
    label: "Classical Crossover",
    icon: "❖",
    description: "Orchestral meets modern production",
    color: "#8B0000",
    subgenres: ["neo-classical", "cinematic", "post-classical", "film score"],
    category: "orchestral-jazz",
  },
  {
    id: "indie-folk",
    label: "Indie Folk",
    icon: "⌘",
    description: "Acoustic fingerpicking, warm harmonies, organic",
    color: "#92400E",
    subgenres: ["chamber folk", "freak folk", "neofolk"],
    category: "orchestral-jazz",
  },
];

// ─── Moods ────────────────────────────────────────────────────────────────────

export const MOODS: Mood[] = [
  { id: "melancholy",    label: "Melancholy",         textures: "tape hiss, reverb wash, detuned chorus",                   intensity: 2 },
  { id: "euphoric",     label: "Euphoric",            textures: "shimmering delays, bright harmonics, ascending arpeggios", intensity: 4 },
  { id: "focused",      label: "Focused / Study",     textures: "steady pulse, warm compression, gentle sidechain",         intensity: 2 },
  { id: "nostalgic",    label: "Nostalgic",           textures: "analog warmth, room mic bleed, vinyl saturation",          intensity: 2 },
  { id: "anxious",      label: "Anxious / Tense",     textures: "dissonant clusters, tremolo picking, unstable pitch",      intensity: 4 },
  { id: "dreamy",       label: "Dreamy / Floating",   textures: "infinite reverb, pitch-shifted pads, soft gating",        intensity: 1 },
  { id: "aggressive",   label: "Aggressive",          textures: "clipped transients, distorted bass, tight compression",   intensity: 5 },
  { id: "contemplative",label: "Contemplative",       textures: "sparse arrangement, natural room tone, gentle fingerpicking", intensity: 1 },
  { id: "bittersweet",  label: "Bittersweet",         textures: "major-minor shifts, string swells, distant piano",        intensity: 3 },
  { id: "energetic",    label: "Energetic / Uplifting",textures: "driving rhythm, bright EQ, syncopated percussion",       intensity: 4 },
];

// ─── Influences ───────────────────────────────────────────────────────────────

export const INFLUENCES: Influence[] = [
  // Original 14
  {
    id: "american-football",
    label: "American Football",
    sonic: "clean tapped guitars, trumpet accents, sprawling reverb, bittersweet melodies in odd time",
    genres: ["math-rock", "lofi"],
    searchTerms: ["midwest", "emo", "twinkle", "tap"],
  },
  {
    id: "last-dinosaurs",
    label: "Last Dinosaurs",
    sonic: "jangly indie guitars, tight punchy drums, upbeat yet wistful vocals, clean production",
    genres: ["bedroom-pop", "dreampop"],
    searchTerms: ["jangle", "indie", "pop", "clean"],
  },
  {
    id: "lush",
    label: "Lush",
    sonic: "dual layered guitars, ethereal female vocals, 4AD-style reverb, dreamy wall of sound",
    genres: ["shoegaze", "dreampop"],
    searchTerms: ["4ad", "ethereal", "wall of sound", "female"],
  },
  {
    id: "hyde",
    label: "HYDE",
    sonic: "dramatic Japanese rock vocals, orchestral swells, gothic atmosphere, soaring melodies",
    genres: ["j-rock", "post-punk"],
    searchTerms: ["japanese", "visual kei", "gothic", "dramatic"],
  },
  {
    id: "oceanlabs",
    label: "OceanLab",
    sonic: "euphoric trance pads, angelic vocals, progressive builds, liquid basslines",
    genres: ["prog-house", "dreampop"],
    searchTerms: ["trance", "euphoric", "anjunabeats", "progressive"],
  },
  {
    id: "snow-strippers",
    label: "Snow Strippers",
    sonic: "hyperpop glitch textures, pitch-shifted vocals, heavy sidechaining, ethereal chaos",
    genres: ["hyperpop", "bedroom-pop"],
    searchTerms: ["glitch", "sidechain", "pitch shift", "chaos"],
  },
  {
    id: "kiri-monoral",
    label: "Monoral (Kiri)",
    sonic: "dark post-punk energy, brooding baritone, reverb-drenched guitars, cinematic tension",
    genres: ["post-punk", "j-rock"],
    searchTerms: ["japanese", "dark", "cinematic", "baritone"],
  },
  {
    id: "toe",
    label: "toe",
    sonic: "intricate polyrhythmic drums, clean guitar harmonics, dynamic builds, post-rock crescendos",
    genres: ["math-rock", "ambient"],
    searchTerms: ["polyrhythm", "japanese", "post-rock", "crescendo"],
  },
  {
    id: "my-bloody-valentine",
    label: "My Bloody Valentine",
    sonic: "glide guitar, extreme pitch-bent tremolo bar, dense layered noise, whispered vocals buried in texture",
    genres: ["shoegaze"],
    searchTerms: ["mbv", "noise", "tremolo", "glide", "loveless"],
  },
  {
    id: "tycho",
    label: "Tycho",
    sonic: "warm analog synths, sunset-colored pads, downtempo groove, ambient guitar layers",
    genres: ["ambient", "lofi", "dreampop"],
    searchTerms: ["downtempo", "chillout", "sunset", "analog"],
  },
  {
    id: "deftones",
    label: "Deftones",
    sonic: "heavy-to-ethereal dynamics, shoegaze-metal layering, dreamy vocals over crushing riffs",
    genres: ["nu-metal", "shoegaze"],
    searchTerms: ["alternative metal", "chino", "ethereal", "heavy"],
  },
  {
    id: "bon-iver",
    label: "Bon Iver",
    sonic: "falsetto vocal layering, granular processed vocals, sparse folk into lush electronic builds",
    genres: ["indie-folk", "ambient"],
    searchTerms: ["folk", "falsetto", "granular", "justin vernon"],
  },
  {
    id: "boards-of-canada",
    label: "Boards of Canada",
    sonic: "detuned analog synths, degraded tape loops, nostalgic lo-fi electronic textures",
    genres: ["ambient", "lofi"],
    searchTerms: ["boc", "idm", "nostalgia", "tape", "electronic"],
  },
  {
    id: "tricot",
    label: "tricot",
    sonic: "angular math-rock riffs, rapid time signature shifts, energetic female Japanese vocals, tight rhythm section",
    genres: ["math-rock", "j-rock"],
    searchTerms: ["japanese", "math rock", "female", "angular"],
  },
  // New V2 Influences
  {
    id: "j-dilla",
    label: "J Dilla",
    sonic: "off-grid swing, dusty MPC chops, warm lo-fi drums, layered sample collage",
    genres: ["hip-hop", "lofi", "rnb"],
    searchTerms: ["dilla", "mpc", "swing", "detroit", "donuts"],
  },
  {
    id: "madlib",
    label: "Madlib",
    sonic: "psychedelic sample collage, world music loops, jazz-inflected boom-bap, dusty crate-dig textures",
    genres: ["hip-hop", "jazz"],
    searchTerms: ["otis", "quasimoto", "samples", "abstract", "beat"],
  },
  {
    id: "kanye-808s",
    label: "Kanye — 808s Era",
    sonic: "Auto-tuned melancholy, 808 heartbeat bass, sparse cold synths, emotional minimalism",
    genres: ["hip-hop", "rnb", "synthwave"],
    searchTerms: ["808", "autotune", "minimal", "heartbreak", "cold"],
  },
  {
    id: "frank-ocean",
    label: "Frank Ocean",
    sonic: "layered falsetto, ambient R&B textures, chopped-and-screwed vocal effects, jazz-tinged harmony",
    genres: ["rnb", "dreampop", "bedroom-pop"],
    searchTerms: ["channel orange", "blonde", "r&b", "falsetto", "ambient"],
  },
  {
    id: "erykah-badu",
    label: "Erykah Badu",
    sonic: "warm analog keys, neo-soul groove, spoken-word cadence, earth-tone production",
    genres: ["rnb", "hip-hop", "jazz"],
    searchTerms: ["neo soul", "analog", "spoken word", "groove"],
  },
  {
    id: "flying-lotus",
    label: "Flying Lotus",
    sonic: "glitchy IDM beats, jazz fusion harmony, layered percussion, astral textures",
    genres: ["hip-hop", "jazz", "ambient"],
    searchTerms: ["flylo", "idm", "brainfeeder", "jazz", "glitch"],
  },
  {
    id: "nujabes",
    label: "Nujabes",
    sonic: "jazzy lo-fi hip-hop, warm piano loops, organic drum breaks, wistful string samples",
    genres: ["lofi", "hip-hop", "jazz"],
    searchTerms: ["samurai champloo", "lo-fi", "chill", "japanese", "jazz hop"],
  },
  {
    id: "metro-boomin",
    label: "Metro Boomin",
    sonic: "cinematic trap, 808 slides, dark orchestral hits, spacious reverb-heavy production",
    genres: ["hip-hop", "phonk"],
    searchTerms: ["trap", "808", "dark", "cinematic", "producer"],
  },
  {
    id: "sza",
    label: "SZA",
    sonic: "breathy intimate vocals, neo-soul over trap production, vulnerability layered in the mix",
    genres: ["rnb", "bedroom-pop"],
    searchTerms: ["ctrl", "sos", "r&b", "vulnerable", "breathy"],
  },
  {
    id: "radiohead",
    label: "Radiohead",
    sonic: "glitchy electronic textures, angular guitar, orchestral tension, genre-dissolving arrangements",
    genres: ["ambient", "shoegaze", "prog-house"],
    searchTerms: ["ok computer", "kid a", "thom yorke", "experimental", "glitch"],
  },
  {
    id: "cocteau-twins",
    label: "Cocteau Twins",
    sonic: "unintelligible ethereal vocals, crystalline guitar arpeggios, lush reverb cathedral",
    genres: ["dreampop", "shoegaze"],
    searchTerms: ["4ad", "ethereal", "dream", "elizabeth fraser"],
  },
  {
    id: "massive-attack",
    label: "Massive Attack",
    sonic: "slow-burn trip-hop bass, paranoid atmosphere, cinematic dread, sparse percussive tension",
    genres: ["ambient", "post-punk", "dnb"],
    searchTerms: ["trip hop", "bristol", "teardrop", "dark", "cinematic"],
  },
  {
    id: "burial",
    label: "Burial",
    sonic: "crackle-laden 2-step, pitched vocal samples, rain-soaked UK bass, melancholic garage textures",
    genres: ["dnb", "ambient", "lofi"],
    searchTerms: ["uk garage", "2-step", "dubstep", "bass", "rain"],
  },
  {
    id: "aphex-twin",
    label: "Aphex Twin",
    sonic: "intricate programmed breakbeats, haunting ambient pads, acid squelch, uncanny melodies",
    genres: ["dnb", "ambient", "hyperpop"],
    searchTerms: ["richard d james", "idm", "acid", "drukqs", "breakbeat"],
  },
  {
    id: "bad-bunny",
    label: "Bad Bunny",
    sonic: "reggaeton dembow with experimental twists, distorted vocals, genre-blending Latin production",
    genres: ["reggaeton", "hip-hop"],
    searchTerms: ["latin trap", "dembow", "puerto rico", "urban", "perreo"],
  },
  {
    id: "burna-boy",
    label: "Burna Boy",
    sonic: "afro-fusion grooves, dancehall-inflected vocals, West African percussion, stadium energy",
    genres: ["afrobeats", "reggaeton"],
    searchTerms: ["afrobeats", "nigerian", "dancehall", "fusion"],
  },
  {
    id: "tame-impala",
    label: "Tame Impala",
    sonic: "phaser-drenched psych-pop, tape-saturated drums, woozy synth bass, neo-psychedelic swirl",
    genres: ["dreampop", "synthwave", "bedroom-pop"],
    searchTerms: ["kevin parker", "psychedelic", "lonerism", "currents", "phaser"],
  },
  {
    id: "nine-inch-nails",
    label: "Nine Inch Nails",
    sonic: "industrial synth aggression, distorted sequencers, quiet-to-loud dynamic extremes, mechanical rhythm",
    genres: ["nu-metal", "post-punk", "ambient"],
    searchTerms: ["nin", "trent reznor", "industrial", "nine inch", "downward spiral"],
  },
  {
    id: "john-coltrane",
    label: "John Coltrane",
    sonic: "modal jazz saxophone sheets of sound, spiritual intensity, chromatic exploration",
    genres: ["jazz", "ambient"],
    searchTerms: ["a love supreme", "sheets of sound", "modal", "saxophone", "spiritual"],
  },
  {
    id: "alice-coltrane",
    label: "Alice Coltrane",
    sonic: "harp glissandos, spiritual jazz drones, Indian classical influence, cosmic expansiveness",
    genres: ["jazz", "ambient", "classical-crossover"],
    searchTerms: ["harp", "spiritual jazz", "cosmic", "drone", "indian"],
  },
  {
    id: "hans-zimmer",
    label: "Hans Zimmer",
    sonic: "massive brass stabs, ticking rhythmic tension, IMAX-scale sub frequencies, orchestral crescendos",
    genres: ["classical-crossover", "ambient"],
    searchTerms: ["film score", "cinematic", "orchestral", "inception", "interstellar"],
  },
  {
    id: "arca",
    label: "Arca",
    sonic: "deconstructed club beats, pitch-shifted vocal manipulation, industrial textures, genre-fluid chaos",
    genres: ["hyperpop", "dnb", "ambient"],
    searchTerms: ["mutant", "experimental", "deconstructed", "club", "venezuela"],
  },
  {
    id: "steve-lacy",
    label: "Steve Lacy",
    sonic: "warm guitar-driven R&B, lo-fi bedroom charm, tight grooves, retro-modern soul",
    genres: ["rnb", "bedroom-pop", "funk"],
    searchTerms: ["the internet", "apollo xxi", "r&b", "guitar", "soul"],
  },
  {
    id: "thundercat",
    label: "Thundercat",
    sonic: "virtuosic bass runs, jazz-funk fusion, falsetto harmonies, aquatic synth textures",
    genres: ["funk", "jazz", "rnb"],
    searchTerms: ["bass", "jazz funk", "drunk", "brainfeeder", "falsetto"],
  },
  {
    id: "corp-kane",
    label: "Dark Phonk / Memphis",
    sonic: "Memphis-style vocal chops, cowbell patterns, distorted 808s, horror-movie atmosphere",
    genres: ["phonk", "hip-hop"],
    searchTerms: ["phonk", "memphis", "cowbell", "horror", "drift"],
  },
];

// ─── Time Signatures ──────────────────────────────────────────────────────────

export const TIME_SIGNATURES: TimeSignature[] = [
  { id: "4-4",   label: "4/4",             description: "Standard time" },
  { id: "3-4",   label: "3/4",             description: "Waltz feel" },
  { id: "2-4",   label: "2/4",             description: "March / polka" },
  { id: "6-8",   label: "6/8",             description: "Compound duple — triplet feel" },
  { id: "9-8",   label: "9/8",             description: "Compound triple — flowing" },
  { id: "12-8",  label: "12/8",            description: "Slow blues shuffle, gospel sway" },
  { id: "5-4",   label: "5/4",             description: "Lopsided groove (Take Five feel)" },
  { id: "5-8",   label: "5/8",             description: "Quick asymmetric pulse" },
  { id: "7-8",   label: "7/8",             description: "Balkan / prog groove" },
  { id: "7-4",   label: "7/4",             description: "Extended odd phrase" },
  { id: "11-8",  label: "11/8",            description: "Complex asymmetric" },
  { id: "13-8",  label: "13/8",            description: "Highly irregular pulse" },
  { id: "15-8",  label: "15/8",            description: "Extended asymmetric — King Crimson territory" },
  { id: "mixed", label: "Mixed / Shifting",description: "Alternating between multiple meters" },
  { id: "free",  label: "Free / Rubato",   description: "No fixed pulse — ebb and flow" },
];

// ─── Chord Voicings ───────────────────────────────────────────────────────────

export const VOICING_CATEGORIES: { id: VoicingCategory; label: string }[] = [
  { id: "bright-open",  label: "Bright / Open" },
  { id: "dark-tense",   label: "Dark / Tense" },
  { id: "groove-soul",  label: "Groove / Soul" },
  { id: "jazz-modern",  label: "Jazz / Modern" },
  { id: "raw",          label: "Raw" },
];

export const CHORD_VOICINGS: ChordVoicing[] = [
  // Bright / Open
  { id: "lydian",      label: "Lydian (#4)",          description: "Bright, floating, dreamlike quality",     category: "bright-open" },
  { id: "maj7sharp11", label: "maj7#11",               description: "Luminous, open, Lydian sparkle",          category: "bright-open" },
  { id: "add9",        label: "add9 / Open Voicings",  description: "Jangly, spacious, indie shimmer",         category: "bright-open" },
  { id: "maj9",        label: "maj9",                  description: "Warm, lush, smooth jazz-pop shimmer",      category: "bright-open" },
  // Dark / Tense
  { id: "phrygian-dom",label: "Phrygian Dominant",     description: "Dark, Spanish/Middle-Eastern tension",    category: "dark-tense" },
  { id: "half-dim",    label: "Half-Diminished",        description: "Jazz melancholy, unresolved yearning",    category: "dark-tense" },
  { id: "dim7",        label: "Diminished 7th",         description: "Tense, cinematic, noir atmosphere",       category: "dark-tense" },
  { id: "sus4b9",      label: "sus4(b9)",               description: "Dissonant beauty, post-rock signature",   category: "dark-tense" },
  { id: "tritone-sub", label: "Tritone Substitution",   description: "Jazz reharmonization — chromatic movement", category: "dark-tense" },
  // Groove / Soul
  { id: "min9",        label: "min9",                   description: "Warm, moody, neo-soul color",             category: "groove-soul" },
  { id: "dom9",        label: "Dominant 9",             description: "Funky, soulful tension — classic R&B/funk",category: "groove-soul" },
  { id: "13",          label: "Dominant 13",            description: "Rich, full, big-band sophistication",     category: "groove-soul" },
  { id: "dom7sharp9",  label: "7#9 (Hendrix chord)",    description: "Gritty, bluesy, psychedelic edge",        category: "groove-soul" },
  // Jazz / Modern
  { id: "min11",       label: "min11",                  description: "Spacious jazz color, open and moody",     category: "jazz-modern" },
  { id: "quartal",     label: "Quartal Voicings",       description: "Stacked fourths — post-bop openness",     category: "jazz-modern" },
  { id: "slash",       label: "Slash Chords (X/Y)",     description: "Bass note independence — movement and tension", category: "jazz-modern" },
  // Raw
  { id: "power-chord", label: "Power Chords (5ths)",    description: "Raw, distorted, punk/metal simplicity",   category: "raw" },
];

// ─── Textures ─────────────────────────────────────────────────────────────────

export interface TextureCategory {
  id: string;
  label: string;
  textures: string[];
}

export const TEXTURE_CATEGORIES: TextureCategory[] = [
  {
    id: "instrument-noise",
    label: "Instrument Noise",
    textures: ["Fret slides", "Finger noise", "String buzz", "Pick scrapes", "Harmonic overtones", "Bow noise", "Key clack", "Drum stick clicks"],
  },
  {
    id: "analog-tape",
    label: "Analog / Tape",
    textures: ["Tape hiss", "Analog warmth", "Vinyl crackle", "Tube saturation", "Amp hum", "Cable hum", "Vinyl record skip"],
  },
  {
    id: "human-feel",
    label: "Human Feel",
    textures: ["Timing drift", "Ghost notes", "Subtle vibrato wobble", "Pedal clicks", "Breath sounds", "Falsetto cracks", "Vocal fry"],
  },
  {
    id: "production-fx",
    label: "Production FX",
    textures: ["Sidechain pump", "Bitcrushed artifacts", "Tape stop effect", "Sample chop stutter", "Room mic bleed"],
  },
  {
    id: "vocal-textures",
    label: "Vocal Textures",
    textures: ["Whispered doubles", "Pitched vocal layers", "Throat singing harmonics"],
  },
  {
    id: "environmental",
    label: "Environmental",
    textures: ["Rain / water ambience", "City noise bleed", "Field recording layer", "Crowd murmur undertone"],
  },
  {
    id: "percussive-detail",
    label: "Percussive Detail",
    textures: ["Finger snaps", "Body percussion", "Shaker rattle", "Tabla ghost notes"],
  },
];

// Flat list for backward compatibility and search
export const TEXTURES: string[] = TEXTURE_CATEGORIES.flatMap((c) => c.textures);

// ─── Tempos ───────────────────────────────────────────────────────────────────

export const TEMPOS: Tempo[] = [
  { label: "Slow (60-80)",      range: "60-80 BPM" },
  { label: "Chill (80-100)",    range: "80-100 BPM" },
  { label: "Mid (100-120)",     range: "100-120 BPM" },
  { label: "Upbeat (120-140)",  range: "120-140 BPM" },
  { label: "Fast (140-170)",    range: "140-170 BPM" },
  { label: "Very Fast (170+)",  range: "170+ BPM" },
];
