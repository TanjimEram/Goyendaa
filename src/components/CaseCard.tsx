import {
  RANKS,
  formatSolveTime,
  formatTaka,
  type CaseFile,
} from "@/lib/cases";

/** Brass pill carrying the rank name and a 3-pip difficulty meter. */
function DifficultyBadge({ rank }: { rank: CaseFile["rank"] }) {
  const { label, pips } = RANKS[rank];

  return (
    <span className="inline-flex items-center gap-2 border border-brass/70 bg-noir/85 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brass backdrop-blur-sm">
      {label}
      <span className="flex gap-[3px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-[7px] w-[7px] ${i < pips ? "bg-brass" : "border border-brass-dim"}`}
          />
        ))}
      </span>
    </span>
  );
}

/**
 * Stand-in for the redacted document preview. Once real page thumbnails exist
 * in Supabase storage this is replaced by an <Image>, but the framing —
 * cream paper, blacked-out names — stays.
 */
function RedactedPreview() {
  return (
    <div aria-hidden className="flex flex-col gap-[5px] p-5">
      <div className="h-1.5 w-1/3 bg-cream/25" />
      <div className="mt-1.5 h-1.5 w-full bg-cream/15" />
      <div className="h-1.5 w-11/12 bg-cream/15" />
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1/4 bg-cream/15" />
        <div className="redacted h-2.5 w-20" />
        <div className="h-1.5 w-1/5 bg-cream/15" />
      </div>
      <div className="h-1.5 w-4/5 bg-cream/15" />
      <div className="flex items-center gap-2">
        <div className="redacted h-2.5 w-14" />
        <div className="h-1.5 w-1/2 bg-cream/15" />
      </div>
      <div className="h-1.5 w-2/3 bg-cream/15" />
    </div>
  );
}

export function CaseCard({ caseFile }: { caseFile: CaseFile }) {
  const { code, title, premise, rank, solveMinutes, pages, priceBdt, tags } =
    caseFile;

  return (
    /* pt-7 reserves room for the folder tab, which sits outside the card. */
    <li className="group relative pt-7">
      {/* Folder tab */}
      <div className="absolute top-0 left-5 flex h-7 items-center border border-b-0 border-noir-line bg-noir-raised px-3 font-mono text-[10px] tracking-[0.2em] text-brass transition-colors duration-300 ease-noir group-hover:border-brass/50">
        {code}
      </div>

      <article className="flex h-full flex-col border border-noir-line bg-noir-raised transition-all duration-300 ease-noir group-hover:-translate-y-1 group-hover:border-brass/50 group-hover:shadow-stamp">
        {/* Document preview */}
        <div className="relative overflow-hidden border-b border-noir-line bg-gradient-to-br from-noir to-noir-raised">
          <RedactedPreview />
          <div className="absolute bottom-3 left-4">
            <DifficultyBadge rank={rank} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-2xl leading-tight font-semibold text-cream">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-[1.7] text-ash">{premise}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="border border-noir-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash"
              >
                {tag}
              </li>
            ))}
          </ul>

          {/* mt-auto pins the footer to the bottom so cards line up. */}
          <div className="mt-auto border-t border-noir-line pt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
              {formatSolveTime(solveMinutes)} &middot; {pages} pages &middot;{" "}
              {RANKS[rank].solutionDelayHours}h to solution
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="font-display text-2xl text-brass">
                {formatTaka(priceBdt)}
              </span>
              <span className="border border-noir-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cream transition-colors duration-300 ease-noir group-hover:border-blood group-hover:bg-blood">
                Take the case
              </span>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
