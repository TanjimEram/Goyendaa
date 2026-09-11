import { BrandStory } from "@/components/BrandStory";
import { FeaturedCases } from "@/components/FeaturedCases";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FeaturedCases />
        <HowItWorks />
        <BrandStory />
      </main>
      <SiteFooter />
    </>
  );
}
