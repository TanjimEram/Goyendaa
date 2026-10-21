import { BrandStory } from "@/components/BrandStory";
import { FeaturedCases } from "@/components/FeaturedCases";
import { FreeCases } from "@/components/FreeCases";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedCases } from "@/lib/cases-data";

// Reads live from Supabase on every request. No ISR cache is configured on
// Cloudflare yet (see CLAUDE.md), so this is the only correct mode for now.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cases = await getPublishedCases();
  // Free cases get their own band first; the casebook row is paid cases.
  const free = cases.filter((c) => c.isFree);
  const paid = cases.filter((c) => !c.isFree);
  // Fall back to the first three if nothing is flagged, so the row is
  // never empty while there are cases to show.
  const flagged = paid.filter((c) => c.featured);
  const featured = (flagged.length ? flagged : paid).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero cases={cases} />
        <FreeCases cases={free} />
        <FeaturedCases cases={featured} />
        <HowItWorks />
        <BrandStory />
      </main>
      <SiteFooter />
    </>
  );
}
