import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseCard, DifficultyBadge } from "@/components/CaseCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SolutionCountdown } from "@/components/SolutionCountdown";
import { RANKS, formatTaka, getRelatedCases } from "@/lib/cases";
import { getPublishedCase, getPublishedCases } from "@/lib/cases-data";
import { formatDateTimeBD, formatTimeBD, mockOrder } from "@/lib/orders";
import { PAYMENT_METHODS } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Case file secured",
  robots: { index: false, follow: false },
};

/* Shared section-eyebrow. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
      <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
      {children}
    </p>
  );
}

/**
 * Post-payment page. Today it renders a MOCK order (see lib/orders.ts) so
 * the design can be judged; when orders are persisted, look the order up
 * by ref from the query string and delete the preview strip.
 */
export default async function SuccessPage({ params }: PageProps<"/checkout/[slug]/success">) {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  if (!caseFile) notFound();

  const order = mockOrder(caseFile);
  const rank = RANKS[caseFile.rank];
  const related = getRelatedCases(caseFile, await getPublishedCases());
  const solutionClock = formatTimeBD(order.solutionAt);

  return (
    <>
      <SiteHeader />

      {/* PREVIEW STRIP — remove when this page reads real orders. */}
      <div className="border-b border-brass/40 bg-brass/10 px-5 py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
        Preview &middot; mock order &middot; no payment was taken
      </div>

      <main className="flex flex-1 flex-col">
        {/* ── Confirmation header ────────────────────────────── */}
        <section className="vignette relative isolate overflow-hidden border-b border-noir-line">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-noir-raised/60 to-noir"
          />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-20">
            <Eyebrow>
              <span className="whitespace-nowrap">Order {order.ref}</span>
              <span aria-hidden className="text-brass-dim">/</span>
              <span className="whitespace-nowrap">{formatDateTimeBD(order.paidAt)}</span>
            </Eyebrow>

            <div className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4">
              <h1 className="max-w-3xl font-display text-[2.6rem] leading-[1.02] font-semibold text-cream sm:text-6xl">
                The file is yours.
              </h1>
              <span
                aria-hidden
                className="mt-2 rotate-[-6deg] border-[3px] border-blood px-4 py-1.5 font-mono text-lg font-semibold tracking-[0.14em] text-blood sm:text-2xl"
              >
                PAID
              </span>
            </div>

            <p className="mt-6 max-w-xl text-base leading-[1.7] text-ash sm:text-lg">
              <span className="text-cream">{caseFile.title}</span> is ready to
              download. A copy of the link has gone to{" "}
              <span className="text-cream">{order.email}</span>. The solution
              follows separately &mdash; see below for exactly when.
            </p>
          </div>
        </section>

        {/* ── Download + solution timing ─────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Download card */}
            <div className="relative flex flex-col border border-brass bg-noir-raised p-6 shadow-stamp sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
                Step 1 &middot; Now
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">
                Download the case file.
              </h2>
              <p className="mt-3 text-sm leading-[1.7] text-ash">
                {caseFile.pages} pages, PDF, A4. Print it &mdash; colour if you
                can, the photographs matter. This link works for 7 days and as
                many times as you like.
              </p>

              <a
                href="#"
                aria-disabled="true"
                className="group mt-6 inline-flex items-center justify-center gap-3 bg-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp"
              >
                Download case file
                <span aria-hidden className="transition-transform duration-300 ease-noir group-hover:translate-y-0.5">
                  &darr;
                </span>
              </a>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                {caseFile.code} &middot; {formatTaka(order.amount)} &middot; paid via{" "}
                {PAYMENT_METHODS[order.method].label}
              </p>
            </div>

            {/* Solution card */}
            <div className="flex flex-col border border-noir-line bg-noir-raised p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
                Step 2 &middot; Later
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">
                The solution arrives{" "}
                <SolutionCountdown
                  solutionAt={order.solutionAt}
                  fallback={`at ${solutionClock}`}
                />
                .
              </h2>
              <p className="mt-3 text-sm leading-[1.7] text-ash">
                {rank.label} files are held for {rank.solutionDelayHours} hour
                {rank.solutionDelayHours === 1 ? "" : "s"} from the moment you
                paid. We&rsquo;ll email the sealed solution to{" "}
                <span className="text-cream">{order.email}</span> at{" "}
                <span className="text-cream">{solutionClock}</span> Bangladesh
                time. It isn&rsquo;t in the download, so there&rsquo;s nothing
                to peek at.
              </p>

              <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-noir-line pt-5 font-mono text-[10px] uppercase tracking-[0.14em]">
                <div>
                  <dt className="text-ash">Paid</dt>
                  <dd className="mt-1 text-cream">{formatTimeBD(order.paidAt)}</dd>
                </div>
                <div>
                  <dt className="text-ash">Solution email</dt>
                  <dd className="mt-1 text-cream">{solutionClock}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* How to play, briefly */}
          <ol className="mt-10 grid gap-6 border-t border-noir-line pt-8 sm:grid-cols-3">
            {[
              ["Print everything", "Spread it across a table. Don't read the pages in order — investigators never get to."],
              ["Build the timeline", "Every statement gives a time. Write them down. The contradiction is usually in the gaps."],
              ["Commit before the email", "Name your suspect and your reasoning before the solution lands. Then open it."],
            ].map(([title, body], i) => (
              <li key={title}>
                <span className="font-mono text-xs tracking-[0.2em] text-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-display text-xl text-cream">{title}</p>
                <p className="mt-2 text-sm leading-[1.7] text-ash">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Receipt ────────────────────────────────────────── */}
        <section className="border-y border-noir-line bg-noir-raised/40">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <Eyebrow>Receipt</Eyebrow>
              <dl className="mt-6 divide-y divide-noir-line border-y border-noir-line text-sm">
                {[
                  ["Order", order.ref],
                  ["Case", `${caseFile.code} — ${caseFile.title}`],
                  ["Email", order.email],
                  ["Paid", `${formatTaka(order.amount)} via ${PAYMENT_METHODS[order.method].label}`],
                  ["Date", formatDateTimeBD(order.paidAt)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">{k}</dt>
                    <dd className="text-right text-cream">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-col justify-end gap-3 text-sm leading-[1.7] text-ash">
              <p>
                <span className="text-cream">Didn&rsquo;t get the email?</span>{" "}
                Check spam, then wait ten minutes. If it&rsquo;s still missing,{" "}
                <Link href="/contact" className="text-cream underline underline-offset-4 hover:text-brass">
                  write to us
                </Link>{" "}
                with your order number.
              </p>
              <p>
                <span className="text-cream">Wrong address?</span> Tell us
                before the solution is sent and we&rsquo;ll redirect it.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <DifficultyBadge rank={caseFile.rank} />
                <Link
                  href={`/cases/${caseFile.slug}`}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash hover:text-brass"
                >
                  Case page &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── While you wait ─────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>Next on the board</Eyebrow>
                <h2 className="mt-4 font-display text-3xl leading-tight font-semibold text-cream sm:text-4xl">
                  Line up the next one.
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
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
