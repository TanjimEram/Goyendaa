import { RANKS, RANK_ORDER, type Rank } from "@/lib/cases";

/**
 * Explains what the three difficulty ranks mean, with the current case's
 * rank highlighted. Rendered on the detail page; the badge in the page
 * header links down to it.
 */
export function RankGuide({ current }: { current: Rank }) {
  return (
    <section
      id="difficulty"
      aria-labelledby="difficulty-heading"
      className="scroll-mt-24 border-y border-noir-line bg-noir-raised/40"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
          <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
          Difficulty ranks
        </p>
        <h2
          id="difficulty-heading"
          className="mt-4 font-display text-3xl leading-tight font-semibold text-cream sm:text-4xl"
        >
          What the rank tells you.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-[1.75] text-ash">
          Rank sets three things: how tangled the evidence is, roughly how long
          it takes, and how long we hold the solution back after you buy.
        </p>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {RANK_ORDER.map((rank) => {
            const meta = RANKS[rank];
            const active = rank === current;
            return (
              <li
                key={rank}
                aria-current={active ? "true" : undefined}
                className={`relative flex flex-col border p-5 sm:p-6 ${
                  active
                    ? "border-brass bg-noir-raised shadow-stamp"
                    : "border-noir-line"
                }`}
              >
                {active && (
                  <span className="absolute -top-3 left-5 bg-blood px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cream">
                    This case
                  </span>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                      active ? "text-brass" : "text-ash"
                    }`}
                  >
                    {meta.label}
                  </span>
                  <span className="flex gap-[3px]" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-[7px] w-[7px] ${
                          i < meta.pips
                            ? active
                              ? "bg-brass"
                              : "bg-brass-dim"
                            : "border border-brass-dim"
                        }`}
                      />
                    ))}
                  </span>
                </div>

                <p
                  className={`mt-3 font-display text-xl leading-snug ${
                    active ? "text-cream" : "text-cream/80"
                  }`}
                >
                  {meta.tagline}
                </p>
                <p className="mt-3 mb-5 text-sm leading-[1.7] text-ash">
                  {meta.description}
                </p>

                <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-noir-line pt-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <div>
                    <dt className="text-ash">Time</dt>
                    <dd className="mt-1 text-cream">{meta.timeRange}</dd>
                  </div>
                  <div>
                    <dt className="text-ash">Suspects</dt>
                    <dd className="mt-1 text-cream">{meta.suspects}</dd>
                  </div>
                  <div>
                    <dt className="text-ash">Solution</dt>
                    <dd className="mt-1 text-cream">
                      +{meta.solutionDelayHours}h
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
