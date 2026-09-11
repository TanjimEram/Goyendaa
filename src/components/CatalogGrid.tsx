"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CaseCard } from "@/components/CaseCard";
import {
  RANKS,
  RANK_ORDER,
  isRank,
  type CaseFile,
  type Rank,
} from "@/lib/cases";

type RankFilter = "all" | Rank;

type SortKey = "catalogue" | "price-asc" | "price-desc" | "difficulty" | "time";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "catalogue", label: "Catalogue order" },
  { value: "difficulty", label: "Difficulty: easy → hard" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "time", label: "Solve time: short → long" },
];

const SORTERS: Record<SortKey, (a: CaseFile, b: CaseFile) => number> = {
  catalogue: () => 0,
  difficulty: (a, b) => RANKS[a.rank].pips - RANKS[b.rank].pips,
  "price-asc": (a, b) => a.priceBdt - b.priceBdt,
  "price-desc": (a, b) => b.priceBdt - a.priceBdt,
  time: (a, b) => a.solveMinutes - b.solveMinutes,
};

/**
 * Filter + sort over an already-loaded list. Purely client-side for now; when
 * the catalogue outgrows one page this moves to the server and the URL param
 * it already writes (`?rank=`) becomes the query.
 */
export function CatalogGrid({ cases }: { cases: CaseFile[] }) {
  const searchParams = useSearchParams();
  const initialRank = searchParams.get("rank");

  const [rank, setRank] = useState<RankFilter>(
    isRank(initialRank) ? initialRank : "all",
  );
  const [sort, setSort] = useState<SortKey>("catalogue");

  // Keep the rank in the URL so filtered views are shareable and the footer's
  // per-rank links land on the right filter. replaceState keeps the Next
  // router in sync without adding history entries for every click.
  function selectRank(next: RankFilter) {
    setRank(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "all") params.delete("rank");
    else params.set("rank", next);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const counts = useMemo(() => {
    const byRank = Object.fromEntries(RANK_ORDER.map((r) => [r, 0])) as Record<
      Rank,
      number
    >;
    for (const c of cases) byRank[c.rank] += 1;
    return byRank;
  }, [cases]);

  const visible = useMemo(() => {
    const filtered =
      rank === "all" ? cases : cases.filter((c) => c.rank === rank);
    // Copy before sorting so `cases` stays in catalogue order. (Not
    // `toSorted` — older Android browsers common in BD lack it.)
    return [...filtered].sort(SORTERS[sort]);
  }, [cases, rank, sort]);

  const filterButtonBase =
    "inline-flex items-center gap-2 border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ease-noir";

  return (
    <div>
      {/* ── Controls ────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 border-y border-noir-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by difficulty rank"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => selectRank("all")}
            aria-pressed={rank === "all"}
            className={`${filterButtonBase} ${
              rank === "all"
                ? "border-brass bg-brass text-noir"
                : "border-noir-line text-ash hover:border-brass/60 hover:text-cream"
            }`}
          >
            All files
            <span className="opacity-70">{cases.length}</span>
          </button>

          {RANK_ORDER.map((r) => {
            const active = rank === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => selectRank(r)}
                aria-pressed={active}
                className={`${filterButtonBase} ${
                  active
                    ? "border-brass bg-brass text-noir"
                    : "border-noir-line text-ash hover:border-brass/60 hover:text-cream"
                }`}
              >
                {RANKS[r].label}
                <span className="flex gap-[3px]" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-[6px] w-[6px] ${
                        i < RANKS[r].pips
                          ? active
                            ? "bg-noir"
                            : "bg-brass"
                          : active
                            ? "border border-noir/50"
                            : "border border-brass-dim"
                      }`}
                    />
                  ))}
                </span>
                <span className="opacity-70">{counts[r]}</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-noir-line bg-noir-raised px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-cream outline-none transition-colors duration-300 ease-noir focus:border-brass"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p
        aria-live="polite"
        className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ash"
      >
        Showing {visible.length} of {cases.length} files
        {rank !== "all" && (
          <>
            {" "}
            &middot; {RANKS[rank].label} &middot;{" "}
            <button
              type="button"
              onClick={() => selectRank("all")}
              className="text-brass underline-offset-4 hover:underline"
            >
              Clear
            </button>
          </>
        )}
      </p>

      {/* ── Board ───────────────────────────────────────────── */}
      {visible.length ? (
        <ul className="evidence-board mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((caseFile) => (
            <CaseCard key={caseFile.slug} caseFile={caseFile} />
          ))}
        </ul>
      ) : (
        <div className="mt-8 border border-noir-line bg-noir-raised px-6 py-16 text-center">
          <p className="font-display text-2xl text-cream">
            No files at this rank yet.
          </p>
          <p className="mt-3 text-sm text-ash">
            The archive is still being assembled. Check the other ranks.
          </p>
        </div>
      )}
    </div>
  );
}
