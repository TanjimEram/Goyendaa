import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseCard, DifficultyBadge } from "@/components/CaseCard";
import {
  PurchaseBar,
  PurchasePanel,
  checkoutHref,
} from "@/components/PurchasePanel";
import { RankGuide } from "@/components/RankGuide";
import { RedactedDocument } from "@/components/RedactedDocument";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  RANKS,
  formatTaka,
  getCaseContents,
  getPreviewDocs,
  getRelatedCases,
} from "@/lib/cases";
import { getPublishedCase, getPublishedCases } from "@/lib/cases-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  if (!caseFile) return { title: "Goyenda" };
  return {
    title: `${caseFile.title} — Goyenda`,
    description: caseFile.premise,
  };
}

/* Shared section-eyebrow so every block on the page opens the same way. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
      <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
      {children}
    </p>
  );
}

export default async function CaseDetailPage({
  params,
}: PageProps<"/cases/[slug]">) {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  if (!caseFile) notFound();

  const rank = RANKS[caseFile.rank];
  const contents = getCaseContents(caseFile);
  // Real gallery images when the admin has uploaded some; generated
  // redacted documents otherwise. Three slots either way.
  const gallery = (caseFile.gallery ?? []).slice(0, 3);
  const previews = gallery.length ? [] : getPreviewDocs(caseFile);
  const related = getRelatedCases(caseFile, await getPublishedCases());

  return (
    <>
      <SiteHeader />
      {/* pb on mobile keeps the footer clear of the pinned buy bar. */}
      <main className="flex flex-1 flex-col pb-24 lg:pb-0">
        {/* ── Case header ─────────────────────────────────────── */}
        <section className="vignette relative isolate overflow-hidden border-b border-noir-line">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-noir-raised/60 to-noir"
          />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-10 pb-14 sm:px-8 sm:pt-14 sm:pb-20">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                <li>
                  <Link
                    href="/cases"
                    className="transition-colors duration-300 ease-noir hover:text-brass"
                  >
                    The Casebook
                  </Link>
                </li>
                <li aria-hidden className="text-brass-dim">
                  /
                </li>
                <li>
                  <Link
                    href={`/cases?rank=${caseFile.rank}`}
                    className="transition-colors duration-300 ease-noir hover:text-brass"
                  >
                    {rank.label}
                  </Link>
                </li>
                <li aria-hidden className="text-brass-dim">
                  /
                </li>
                <li aria-current="page" className="text-cream">
                  {caseFile.code}
                </li>
              </ol>
            </nav>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
              <div>
                <Eyebrow>
                  {caseFile.code}
                  <span aria-hidden className="text-brass-dim">
                    /
                  </span>
                  {caseFile.tags.join(" · ")}
                </Eyebrow>

                <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-semibold text-cream sm:text-6xl lg:text-7xl">
                  {caseFile.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <a
                    href="#difficulty"
                    title={rank.tagline}
                    className="inline-flex items-center gap-2 transition-opacity duration-300 ease-noir hover:opacity-80"
                  >
                    <DifficultyBadge rank={caseFile.rank} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash underline decoration-brass-dim underline-offset-4">
                      What does this mean?
                    </span>
                  </a>
                  <span className="font-display text-3xl text-brass lg:hidden">
                    {formatTaka(caseFile.priceBdt)}
                  </span>
                </div>

                {/* The hook — tease only. */}
                <p className="mt-8 max-w-2xl font-display text-xl leading-[1.55] text-cream/90 sm:text-2xl">
                  {caseFile.hook}
                </p>

                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                  {rank.timeRange} &middot; {rank.suspects} &middot;{" "}
                  {caseFile.pages} printed pages
                </p>
              </div>

              {/* Desktop buy box. On phones the pinned PurchaseBar takes over. */}
              <div className="hidden lg:block">
                <PurchasePanel caseFile={caseFile} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Contents ────────────────────────────────────────── */}
        <section
          aria-labelledby="contents-heading"
          className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <Eyebrow>What&rsquo;s in the file</Eyebrow>
          <h2
            id="contents-heading"
            className="mt-4 font-display text-3xl leading-tight font-semibold text-cream sm:text-4xl"
          >
            {caseFile.pages} pages. Every one of them matters.
          </h2>

          <ol className="mt-10 grid gap-px border border-noir-line bg-noir-line sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((item, i) => {
              const sealed = item.label.toLowerCase().includes("solution");
              return (
                <li
                  key={item.label}
                  className={`flex gap-4 p-5 ${
                    sealed
                      ? "bg-noir-raised sm:col-span-2 lg:col-span-3"
                      : "bg-noir"
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-[0.16em] text-brass-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream">
                      {item.count ? `${item.count} × ` : ""}
                      {item.label}
                      {sealed && (
                        <span className="ml-2 bg-blood px-1.5 py-0.5 text-[9px] text-cream">
                          Sealed
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5 text-sm leading-[1.65] text-ash">
                      {item.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── Previews ────────────────────────────────────────── */}
        <section
          aria-labelledby="previews-heading"
          className="border-y border-noir-line bg-noir-raised/40"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>From the evidence pack</Eyebrow>
                <h2
                  id="previews-heading"
                  className="mt-4 font-display text-3xl leading-tight font-semibold text-cream sm:text-4xl"
                >
                  Three pages, redacted.
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-[1.7] text-ash">
                Names and anything that would give the game away are blacked
                out here. In the file, they aren&rsquo;t.
              </p>
            </div>

            <div className="evidence-board mt-10 grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src, i) => (
                <RedactedDocument
                  key={src}
                  heading={`Page ${i + 1}`}
                  code={caseFile.code}
                  index={i}
                  imageSrc={src}
                />
              ))}
              {previews.map((heading, i) => (
                <RedactedDocument
                  key={heading}
                  heading={heading}
                  code={caseFile.code}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Difficulty ──────────────────────────────────────── */}
        <RankGuide current={caseFile.rank} />

        {/* ── Second CTA + other files ────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col gap-8 border border-noir-line bg-noir-raised p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                {caseFile.code} &middot; {rank.label}
              </p>
              <p className="mt-2 font-display text-2xl text-cream sm:text-3xl">
                Take <em className="text-brass not-italic">{caseFile.title}</em>{" "}
                for {formatTaka(caseFile.priceBdt)}.
              </p>
            </div>
            <Link
              href={checkoutHref(caseFile)}
              className="group inline-flex shrink-0 items-center justify-center gap-3 bg-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp"
            >
              Buy case file
              <span
                aria-hidden
                className="transition-transform duration-300 ease-noir group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>

          <div className="mt-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Other files</Eyebrow>
              <h2 className="mt-4 font-display text-3xl leading-tight font-semibold text-cream sm:text-4xl">
                Nearby on the board.
              </h2>
            </div>
            <Link
              href="/cases"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-ash underline-offset-8 transition-colors duration-300 ease-noir hover:text-brass hover:underline"
            >
              All cases &rarr;
            </Link>
          </div>
          <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CaseCard key={c.slug} caseFile={c} />
            ))}
          </ul>

          <p className="mt-14 border-l-2 border-brass-dim pl-4 font-mono text-[11px] leading-[1.9] tracking-[0.06em] text-ash">
            Every case is fictional. Names, places and events are invented
            &mdash; the reasoning is not.
          </p>
        </section>
      </main>
      <SiteFooter />
      <PurchaseBar caseFile={caseFile} />
    </>
  );
}
