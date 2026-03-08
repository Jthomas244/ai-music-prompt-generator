import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
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
    <html lang="en" className={`${sora.variable} ${spaceMono.variable}`}>
      <body className="font-sora bg-app text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
