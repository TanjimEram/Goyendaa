/**
 * DEV-ONLY texture mockup: /dev/texture-mockup
 *
 * Renders the REAL components unmodified, wrapped in .tx-* elements that
 * texture.css styles from outside. 404s outside `next dev`, noindex, linked
 * from nowhere. Query params preset the panel (for screenshots):
 *   ?tx=off|subtle|medium  &compare=1  &dot=neutral|gold|red  &size=6..12
 *   &alpha=0.02..0.3  &panel=0  &no=hero,sections,cards,buttons,footer,social
 */
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BrandStory } from "@/components/BrandStory";
import { DifficultyBadge } from "@/components/CaseCard";
import { FeaturedCases } from "@/components/FeaturedCases";
import { FreeCases } from "@/components/FreeCases";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { PurchasePanel } from "@/components/PurchasePanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { RANK_ORDER } from "@/lib/cases";
import { getPublishedCases } from "@/lib/cases-data";
import { SocialPreview } from "./SocialPreview";
import { TextureStage, type TxInitial } from "./TextureStage";
import "./texture.css";

export const metadata: Metadata = {
  title: "Texture mockup (dev)",
  robots: { index: false, follow: false },
};

type Search = Record<string, string | string[] | undefined>;

/** A labelled band for the mock-only demos, so they can't be mistaken for real sections. */
function MockBand({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">Mockup &middot; {title}</p>
      {note && <p className="mt-2 max-w-2xl text-sm leading-[1.7] text-ash">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function TextureMockupPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  const q = await searchParams;
  const one = (k: string) => (typeof q[k] === "string" ? (q[k] as string) : undefined);
  const tx = one("tx");
  const dot = one("dot");
  const cases = await getPublishedCases();
  const saveData = (await headers()).get("save-data") === "on";

  // Same selection as the homepage.
  const free = cases.filter((c) => c.isFree);
  const paid = cases.filter((c) => !c.isFree);
  const flagged = paid.filter((c) => c.featured);
  const featured = (flagged.length ? flagged : paid).slice(0, 3);
  const sample = paid[0] ?? cases[0];

  const initial: TxInitial = {
    intensity: tx === "off" || tx === "medium" ? tx : "subtle",
    compare: one("compare") === "1",
    dot: dot === "gold" || dot === "red" ? dot : "neutral",
    dotSize: Math.min(12, Math.max(6, Number(one("size")) || 8)),
    dotAlpha: Math.min(0.3, Math.max(0.02, Number(one("alpha")) || (dot === "gold" || dot === "red" ? 0.08 : 0.1))),
    saveData,
    open: one("panel") !== "0",
    off: (one("no") ?? "").split(",").filter(Boolean) as TxInitial["off"],
  };

  return (
    <>
      <SiteHeader />
      <TextureStage initial={initial}>
        <main className="flex flex-1 flex-col">
          <div className="tx-hero">
            <Hero cases={cases} />
          </div>
          {free.length > 0 && (
            <div className="tx-sec tx-cards">
              <FreeCases cases={free} />
            </div>
          )}
          <div id="tx-cards" className="tx-cards">
            <FeaturedCases cases={featured} />
          </div>
          <div className="tx-sec">
            <HowItWorks />
          </div>
          {sample && (
            <MockBand title="Buy box and difficulty badges (case page)">
              <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
                <div className="flex flex-wrap gap-3">
                  {RANK_ORDER.map((r) => (
                    <DifficultyBadge key={r} rank={r} />
                  ))}
                </div>
                <PurchasePanel caseFile={sample} />
              </div>
            </MockBand>
          )}
          <BrandStory />
          {sample && (
            <MockBand
              title="Social post previews"
              note="Same dot screen and grain tile as the site, built at 1080 px. A feed shows these at about a third of their size, so the dots read smaller there than on the site."
            >
              <SocialPreview caseFile={sample} />
            </MockBand>
          )}
          <MockBand
            title="Intentionally left clean"
            note="Long-form reading and anything to do with money stay untextured: case descriptions, FAQ answers, the checkout and payment pages, and the admin area. Below is a case description as it renders today, with no texture, at every setting."
          >
            {sample && (
              <div className="max-w-2xl border border-noir-line bg-noir-raised p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">Case description &middot; untouched</p>
                <p className="mt-4 leading-[1.8] text-cream">{sample.hook || sample.premise}</p>
              </div>
            )}
          </MockBand>
        </main>
        <div className="tx-footer">
          <SiteFooter />
        </div>
      </TextureStage>
    </>
  );
}
