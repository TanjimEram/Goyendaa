import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogGrid } from "@/components/CatalogGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedCases } from "@/lib/cases-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Casebook",
  description:
    "Every open Goyenda case file. Filter by difficulty rank, pick a case, print the evidence and work it.",
};

export default async function CasesPage() {
  const cases = await getPublishedCases();
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {/* ── Page header ─────────────────────────────────────── */}
        <section className="border-b border-noir-line">
          <div className="mx-auto w-full max-w-6xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-16">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
              <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
              The Casebook
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-cream sm:text-6xl">
              Every file currently open.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-ash sm:text-lg">
              Pick a rank you can handle. Each file is a complete printable
              evidence pack &mdash; the solution follows by email, hours after
              you buy.
            </p>
          </div>
        </section>

        {/* ── Catalogue ───────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          {/* useSearchParams inside CatalogGrid needs a Suspense boundary so
              the page can still be prerendered as static HTML. */}
          <Suspense fallback={<CatalogFallback />}>
            <CatalogGrid cases={cases} />
          </Suspense>

          <p className="mt-14 border-l-2 border-brass-dim pl-4 font-mono text-[11px] leading-[1.9] tracking-[0.06em] text-ash">
            Every case is fictional. Names, places and events are invented
            &mdash; the reasoning is not.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/** Shown for the instant before the client grid hydrates. Same height as
 *  the controls bar so nothing jumps. */
function CatalogFallback() {
  return (
    <div className="border-y border-noir-line py-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
        Opening the archive&hellip;
      </p>
    </div>
  );
}
