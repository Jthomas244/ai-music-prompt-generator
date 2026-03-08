import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      colors: {
        app: "#141420",
        primary: "#EAEAF0",
        secondary: "#A8A8BC",
        muted: "#78788C",
        surface: "rgba(255,255,255,0.045)",
        "surface-hover": "rgba(255,255,255,0.075)",
        border: "rgba(255,255,255,0.09)",
        "border-strong": "rgba(255,255,255,0.14)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", maxHeight: "0" },
          "100%": { opacity: "1", maxHeight: "1000px" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
