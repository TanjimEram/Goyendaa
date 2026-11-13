/**
 * DEV-ONLY mockup of the hero with ambient motion: /dev/hero-mockup
 *
 * 404s outside `next dev` (the NODE_ENV check below), carries noindex, and
 * is linked from nowhere. Query params preset the panel, for screenshots:
 *   ?hero=current|enhanced  &fx=off|subtle|medium  &grain=0 &blinds=0
 *   &parallax=0  &reduced=1  &lowend=ignore  &panel=0
 */
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BrandStory } from "@/components/BrandStory";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedCases } from "@/lib/cases-data";
import { DEFAULT_FX, type Intensity } from "./Evidence";
import { HeroEnhanced } from "./HeroEnhanced";
import { MockupStage } from "./MockupStage";

export const metadata: Metadata = {
  title: "Hero mockup (dev)",
  robots: { index: false, follow: false },
};

type Search = Record<string, string | string[] | undefined>;

export default async function HeroMockupPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  const q = await searchParams;
  const one = (k: string) => (typeof q[k] === "string" ? (q[k] as string) : undefined);
  const fx = one("fx");
  const cases = await getPublishedCases();
  const saveData = (await headers()).get("save-data") === "on";

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <MockupStage
          current={<Hero cases={cases} />}
          enhanced={<HeroEnhanced cases={cases} saveData={saveData} />}
          initialHero={one("hero") === "current" ? "current" : "enhanced"}
          initialOpen={one("panel") !== "0"}
          initial={{
            ...DEFAULT_FX,
            intensity: fx === "off" || fx === "medium" ? (fx as Intensity) : "subtle",
            grain: one("grain") !== "0",
            blinds: one("blinds") !== "0",
            parallax: one("parallax") !== "0",
            simulateReduced: one("reduced") === "1",
            ignoreLowEnd: one("lowend") === "ignore",
          }}
        />
        {/* Real sections below, so there is something to scroll past. */}
        <HowItWorks />
        <BrandStory />
      </main>
      <SiteFooter />
    </>
  );
}
