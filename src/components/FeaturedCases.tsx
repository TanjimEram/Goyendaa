import Link from "next/link";
import { CaseCard } from "@/components/CaseCard";
import type { CaseFile } from "@/lib/cases";

const COUNT_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six"];

export function FeaturedCases({ cases }: { cases: CaseFile[] }) {
  return (
    <section
      id="casebook"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
            The Casebook
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-semibold text-cream sm:text-5xl">
            {cases.length
              ? `${COUNT_WORDS[cases.length] ?? cases.length} files to start with.`
              : "The archive is being assembled."}
          </h2>
        </div>

        <Link
          href="/cases"
          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-ash underline-offset-8 transition-colors duration-300 ease-noir hover:text-brass hover:underline"
        >
          View all cases &rarr;
        </Link>
      </div>

      <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((caseFile) => (
          <CaseCard key={caseFile.slug} caseFile={caseFile} />
        ))}
      </ul>

      <p className="mt-12 border-l-2 border-brass-dim pl-4 font-mono text-[11px] leading-[1.9] tracking-[0.06em] text-ash">
        Every case is fictional. Names, places and events are invented &mdash;
        the reasoning is not.
      </p>
    </section>
  );
}
