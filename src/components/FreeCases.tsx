import { CaseCard } from "@/components/CaseCard";
import type { CaseFile } from "@/lib/cases";

/**
 * Homepage: the free case(s), highlighted, above the paid casebook. The
 * first case most visitors will ever play, so it gets its own band.
 */
export function FreeCases({ cases }: { cases: CaseFile[] }) {
  if (!cases.length) return null;
  return (
    <section
      id="free"
      aria-labelledby="free-heading"
      className="scroll-mt-20 border-y border-brass/40 bg-noir-raised/60"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
          <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
          Start here
        </p>
        <h2 id="free-heading" className="mt-4 font-display text-4xl leading-tight font-semibold text-cream sm:text-5xl">
          Start here: free case.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-[1.7] text-ash">
          A complete case, on the house. Print it, solve it in fifteen minutes, then check the answer.
        </p>
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <CaseCard key={c.slug} caseFile={c} />
          ))}
        </ul>
      </div>
    </section>
  );
}
