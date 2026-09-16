import type { Config } from "tailwindcss";

/**
 * Tokens from the TonePrompt visual design spec: warm near-black ground, two flat panel
 * levels, coral + teal accents (exposed as CSS variables so they can be swapped), and a
 * three-face type system (Fraunces / IBM Plex Sans / IBM Plex Mono).
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ground: "#15130F",
        panel: "#1E1A14",
        raised: "#262019",
        primary: "#F4EFE4",
        secondary: "#A79A85",
        muted: "#7C7264",
        output: "#E9E2D3",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        accent2: "rgb(var(--accent2-rgb) / <alpha-value>)",
        line: "rgba(255,255,255,0.08)",
        "line-strong": "rgba(255,255,255,0.12)",
        fill: "rgba(255,255,255,0.04)",
        "fill-hover": "rgba(255,255,255,0.07)",
        "fill-quiet": "rgba(255,255,255,0.03)",
      },
      borderRadius: {
        pill: "999px",
        card: "20px",
        item: "14px",
        control: "12px",
        "control-sm": "10px",
      },
      keyframes: {
        waveform: {
          "0%": { transform: "scaleY(0.2)" },
          "100%": { transform: "scaleY(1)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        waveform: "waveform 0.7s ease-in-out infinite alternate",
        "pulse-glow": "pulseGlow 1.6s ease-in-out infinite",
        "fade-in": "fadeIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
