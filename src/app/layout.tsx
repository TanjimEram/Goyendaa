import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

// Headlines. Variable font — no explicit weight needed.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

// Body copy. Variable font.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Case metadata, tags, stamps. Not a variable font — weights are explicit.
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Goyenda — Printable Detective Case Files",
  description:
    "Downloadable murder-mystery case files. Print the evidence, work the case, and get the solution later by email. Fictional cases, real detective work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-noir font-sans text-cream">
        {children}
        {/* Film grain sits above everything; pointer-events are off. */}
        <div aria-hidden className="grain-overlay" />
      </body>
    </html>
  );
}
