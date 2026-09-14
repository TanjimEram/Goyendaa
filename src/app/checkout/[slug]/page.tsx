import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/CaseCard";
import { CheckoutForm } from "@/components/CheckoutForm";
import { buyingLines } from "@/components/PurchasePanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { RANKS, formatSolveTime, formatTaka } from "@/lib/cases";
import { getPublishedCase } from "@/lib/cases-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/checkout/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  return {
    title: caseFile ? `Checkout — ${caseFile.title}` : "Checkout",
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: PageProps<"/checkout/[slug]">) {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  if (!caseFile) notFound();

  const rank = RANKS[caseFile.rank];

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href={`/cases/${caseFile.slug}`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors duration-300 ease-noir hover:text-brass"
          >
            &larr; Back to the file
          </Link>

          <p className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
            Checkout
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-cream sm:text-5xl">
            Take the case.
          </h1>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
            {/* ── Form ─────────────────────────────────────────── */}
            <div className="order-2 lg:order-1">
              <CheckoutForm
                slug={caseFile.slug}
                title={caseFile.title}
                amount={caseFile.priceBdt}
                solutionDelayHours={rank.solutionDelayHours}
              />
            </div>

            {/* ── Order summary ────────────────────────────────── */}
            <aside
              aria-label="Order summary"
              className="order-1 border border-noir-line bg-noir-raised lg:order-2 lg:sticky lg:top-24 lg:self-start"
            >
              <div
                className={`relative overflow-hidden border-b border-noir-line bg-noir ${
                  caseFile.thumbnail ? "aspect-[16/9]" : "h-24"
                }`}
              >
                {caseFile.thumbnail ? (
                  <Image
                    src={caseFile.thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-end p-5 font-mono text-[10px] uppercase tracking-[0.2em] text-brass-dim">
                    {caseFile.code}
                  </div>
                )}
                <div className="absolute bottom-3 left-4">
                  <DifficultyBadge rank={caseFile.rank} />
                </div>
              </div>

              <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-brass">
                  {caseFile.code}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-cream">
                  {caseFile.title}
                </h2>
                <p className="mt-3 text-sm leading-[1.7] text-ash">{caseFile.premise}</p>

                <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-noir-line py-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <div>
                    <dt className="text-ash">Solve time</dt>
                    <dd className="mt-1 text-cream">~{formatSolveTime(caseFile.solveMinutes)}</dd>
                  </div>
                  <div>
                    <dt className="text-ash">Pages</dt>
                    <dd className="mt-1 text-cream">{caseFile.pages}</dd>
                  </div>
                  <div>
                    <dt className="text-ash">Solution</dt>
                    <dd className="mt-1 text-cream">+{rank.solutionDelayHours}h</dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                    Total
                  </span>
                  <span className="font-display text-3xl text-brass">
                    {formatTaka(caseFile.priceBdt)}
                  </span>
                </div>

                <ul className="mt-5 flex flex-col gap-2 border-t border-noir-line pt-4 text-xs leading-[1.6] text-ash">
                  {buyingLines(caseFile).map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-[7px] h-1 w-1 shrink-0 bg-brass" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
