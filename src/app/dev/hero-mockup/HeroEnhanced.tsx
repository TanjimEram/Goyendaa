/**
 * MOCKUP ONLY: the homepage hero with the ambient motion layers added.
 *
 * Copy, buttons, layout and tokens are copied verbatim from
 * src/components/Hero.tsx (minus the empty video slot). The only additions
 * are marked "FX". If this is approved, those additions move into Hero.tsx
 * and this file is deleted, so the two never drift for long.
 */
import Link from "next/link";
import { formatTaka, type CaseFile } from "@/lib/cases";
import { Evidence } from "./Evidence";
import "./hero-fx.css";

const HERO_POSTER = "/hero-poster.svg";

function statsFor(cases: CaseFile[]) {
  if (!cases.length) {
    return [
      { value: "—", label: "Cases open" },
      { value: "—", label: "Per file" },
      { value: "—", label: "Printed pages" },
    ];
  }
  const pages = cases.map((c) => c.pages);
  const prices = cases.map((c) => c.priceBdt);
  return [
    { value: String(cases.length), label: "Cases open" },
    { value: `${formatTaka(Math.min(...prices))}+`, label: "Per file" },
    {
      value: `${Math.min(...pages)}–${Math.max(...pages)}`,
      label: "Printed pages",
    },
  ];
}

export function HeroEnhanced({ cases, saveData }: { cases: CaseFile[]; saveData: boolean }) {
  const STATS = statsFor(cases);
  return (
    <section
      id="top"
      // FX: defaults the effects run with before (or without) JavaScript.
      className="hero-fx vignette relative isolate flex min-h-[88svh] items-center overflow-hidden border-b border-noir-line"
      data-fx="subtle"
      data-fx-grain="on"
      data-fx-blinds="on"
      data-fx-parallax="on"
      data-fx-lite={saveData ? "1" : undefined}
    >
      {/* ── Backdrop layers ─────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url('${HERO_POSTER}')` }}
      />

      {/* FX: blind shadows, under the scrim so the copy side stays dark. */}
      <div aria-hidden className="fx-layer fx-blinds -z-10">
        <div className="fx-anim fx-blinds-bands" />
      </div>

      {/* Scrim — keeps the headline legible whatever plays behind it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-noir via-noir/90 to-noir/40"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-noir to-transparent"
      />

      {/* FX: grain and floating evidence, above the scrim, below the copy. */}
      <div aria-hidden className="fx-layer fx-anim fx-grain" />
      <Evidence />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
          <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
          Digital case files
          <span className="text-brass-dim" aria-hidden>
            /
          </span>
          Print at home
        </p>

        <h1 className="mt-7 max-w-4xl font-display text-[2.75rem] leading-[1.04] font-semibold text-cream sm:text-6xl lg:text-7xl">
          The evidence is all here.
          <br />
          <span className="text-brass">The answer isn&rsquo;t.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-[1.7] text-ash sm:text-lg">
          Print a real case file &mdash; witness statements, interrogation
          transcripts, forensic notes, crime-scene photographs. Spread it across
          a table and work it like an investigator would. The solution is
          emailed to you separately, hours later, so you can&rsquo;t peek your
          way out of it.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/cases"
            className="group inline-flex items-center justify-center gap-3 bg-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp"
          >
            Open a case
            <span
              aria-hidden
              className="transition-transform duration-300 ease-noir group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center border border-noir-line px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors duration-300 ease-noir hover:border-brass hover:text-brass"
          >
            How it works
          </a>
        </div>

        {/* Stat strip */}
        <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-noir-line pt-7 sm:mt-16 sm:gap-x-16">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-2xl text-cream sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
