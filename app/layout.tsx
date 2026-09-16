import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TonePrompt — AI Music Prompt Generator",
  description:
    "TonePrompt — Transform musical ideas into expert-level prompts for AI music platforms.",
  keywords: ["AI music", "Suno prompts", "music generation", "prompt engineering", "TonePrompt"],
  openGraph: {
    title: "TonePrompt — AI Music Prompt Generator",
    description:
      "TonePrompt — Transform musical ideas into expert-level prompts for AI music platforms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans bg-ground text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
