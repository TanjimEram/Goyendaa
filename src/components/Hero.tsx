/**
 * Hero with a background-video slot.
 *
 * To switch the hero to video: drop an .mp4/.webm into /public and set
 * HERO_VIDEO_SRC below. Until then the poster SVG carries the section, so
 * nothing else needs to change. The video is decorative — muted, looping,
 * and never the sole carrier of information.
 */
import Link from "next/link";
import { ALL_CASES, formatTaka } from "@/lib/cases";

const HERO_VIDEO_SRC: string = "";
const HERO_POSTER = "/hero-poster.svg";

// Derived from the catalogue so the numbers can't go stale.
const pageCounts = ALL_CASES.map((c) => c.pages);
const STATS = [
  { value: String(ALL_CASES.length), label: "Cases open" },
  {
    value: `${formatTaka(Math.min(...ALL_CASES.map((c) => c.priceBdt)))}+`,
    label: "Per file",
  },
  {
    value: `${Math.min(...pageCounts)}–${Math.max(...pageCounts)}`,
    label: "Printed pages",
  },
];

export function Hero() {
  return (
    <section
      id="top"
      className="vignette relative isolate flex min-h-[88svh] items-center overflow-hidden border-b border-noir-line"
    >
      {/* ── Backdrop layers ─────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url('${HERO_POSTER}')` }}
      />

      {HERO_VIDEO_SRC && (
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO_SRC} />
        </video>
      )}

      {/* Scrim — keeps the headline legible whatever plays behind it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-noir via-noir/90 to-noir/40"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-noir to-transparent"
      />

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
