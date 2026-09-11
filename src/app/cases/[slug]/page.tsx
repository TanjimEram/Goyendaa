import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/CaseCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ALL_CASES, formatTaka } from "@/lib/cases";

/**
 * PLACEHOLDER. The real case-detail page (premise teaser, redacted document
 * previews, buy CTA) is the next build step. This exists so catalogue cards
 * link somewhere meaningful instead of a 404.
 */

export function generateStaticParams() {
  return ALL_CASES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseFile = ALL_CASES.find((c) => c.slug === slug);
  return { title: caseFile ? `${caseFile.title} — Goyenda` : "Goyenda" };
}

export default async function CaseDetailPlaceholder({
  params,
}: PageProps<"/cases/[slug]">) {
  const { slug } = await params;
  const caseFile = ALL_CASES.find((c) => c.slug === slug);
  if (!caseFile) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-20 sm:px-8 sm:py-28">
          <Link
            href="/cases"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition-colors duration-300 ease-noir hover:text-brass"
          >
            &larr; Back to the Casebook
          </Link>

          <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-brass">
            {caseFile.code}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] font-semibold text-cream sm:text-6xl">
            {caseFile.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <DifficultyBadge rank={caseFile.rank} />
            <span className="font-display text-2xl text-brass">
              {formatTaka(caseFile.priceBdt)}
            </span>
          </div>

          <div className="relative mt-12 max-w-xl border border-noir-line bg-noir-raised p-6 sm:p-8">
            <p className="text-base leading-[1.75] text-ash">
              This file is still being assembled. The full brief, document
              previews and purchase option arrive with the next build.
            </p>
            <span
              aria-hidden
              className="absolute -top-4 right-5 rotate-[6deg] border-[3px] border-blood px-3 py-1 font-mono text-sm font-semibold tracking-[0.14em] text-blood"
            >
              PENDING
            </span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
