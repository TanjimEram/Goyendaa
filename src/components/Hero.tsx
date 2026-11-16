/**
 * Hero over a background loop: a noir flip-book of case panels (HeroVideo),
 * built in Goyenda-Studio/Reels/hero-intro (build_web.sh → public/hero/).
 * The loop is decoration only. The poster (its first frame) paints first and
 * stays for reduced motion, Save-Data and low-end phones; a dark overlay and
 * the scrim keep the copy on top.
 */
import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
import { formatTaka, type CaseFile } from "@/lib/cases";

const HERO_POSTER = { wide: "/hero/hero-poster-1920x1080.jpg", tall: "/hero/hero-poster-720x1280.jpg" };

/** Stat strip, derived from the live catalogue so it can't go stale. */
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

export function Hero({ cases }: { cases: CaseFile[] }) {
  const STATS = statsFor(cases);
  return (
    <section
      id="top"
      className="vignette relative isolate flex min-h-[88svh] items-center overflow-hidden border-b border-noir-line"
    >
      {/* ── Backdrop layers ─────────────────────────────────── */}
      <picture>
        <source media="(max-width: 767px)" srcSet={HERO_POSTER.tall} />
        <img
          src={HERO_POSTER.wide}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      </picture>
      <HeroVideo />
      {/* Darkening, shaped so the loop stays visible but never outshines the
          copy. Phones: the copy spans the width, so an even overlay. md+: dark
          behind the copy column, opening up toward the right. The copy also
          carries a soft dark halo (below). Re-measure contrast over the video
          frames if any of these change. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-noir/78 md:hidden" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-noir/92 from-0% via-noir/85 via-50% to-noir/0 to-95% md:block"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-noir to-transparent"
      />

      {/* Print texture: halftone dots from the far corner, then grain. Both
          sit under the copy (z-10); globals.css, "PRINT TEXTURES". */}
      <div aria-hidden className="halftone-corner absolute inset-0" />
      <div aria-hidden className="grain absolute inset-0" />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-24 [text-shadow:0_0_28px_rgb(0_0_0/0.95),0_0_14px_rgb(0_0_0/0.95),0_0_5px_rgb(0_0_0/0.9)] sm:px-8 sm:py-28">
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

        <p className="mt-7 max-w-xl text-base leading-[1.7] text-cream/85 sm:text-lg">
          Print a real case file &mdash; witness statements, interrogation
          transcripts, forensic notes, crime-scene photographs. Spread it across
          a table and work it like an investigator would. The solution is
          emailed to you separately, hours later, so you can&rsquo;t peek your
          way out of it.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/cases"
            className="group inline-flex items-center justify-center gap-3 bg-blood grain-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:grain-blood-hot hover:shadow-stamp"
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
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-cream/75">
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
