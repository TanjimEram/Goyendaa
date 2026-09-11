/**
 * Placeholder case data for the homepage teaser row.
 *
 * This is hard-coded on purpose — Supabase is not wired up yet. When the
 * `cases` table lands, this module keeps its shape and only the loader
 * changes, so `CaseCard` and the catalog page won't need edits.
 *
 * EDITORIAL RULE: every case is invented. Cases may echo *patterns* found in
 * real investigations (a staged scene, a falsified alibi) but must never
 * reproduce a real, identifiable victim, suspect, or crime. Place names are
 * fictional for the same reason.
 */

/** Difficulty tiers. Each tier sets how long the solution email is held back. */
export type Rank = "rookie" | "senior" | "master";

export interface RankMeta {
  /** Shown on the badge. */
  label: string;
  /** Filled pips out of 3, for the badge's difficulty meter. */
  pips: number;
  /** Hours between purchase and the solution email. Purchase time is the
   *  trigger — not download time. */
  solutionDelayHours: number;
}

export const RANKS: Record<Rank, RankMeta> = {
  rookie: { label: "Rookie Goyenda", pips: 1, solutionDelayHours: 1 },
  senior: { label: "Senior Goyenda", pips: 2, solutionDelayHours: 2 },
  master: { label: "Master Goyenda", pips: 3, solutionDelayHours: 3 },
};

export interface CaseFile {
  slug: string;
  /** Printed on the folder tab, e.g. "CASE 001". */
  code: string;
  title: string;
  /** One line. Sets the hook without giving away the mechanism. */
  premise: string;
  rank: Rank;
  /** Rough time to work the case, in minutes. */
  solveMinutes: number;
  /** Pages in the printable evidence pack. */
  pages: number;
  /** Price in BDT. Displayed with the ৳ sign. */
  priceBdt: number;
  tags: string[];
}

export const FEATURED_CASES: CaseFile[] = [
  {
    slug: "the-rainhouse-key",
    code: "CASE 001",
    title: "The Rainhouse Key",
    premise:
      "A riverside guesthouse locked from the inside, one key on the table — and a guest who signed out three hours after he died.",
    rank: "rookie",
    solveMinutes: 45,
    pages: 18,
    priceBdt: 250,
    tags: ["Locked room", "Two suspects"],
  },
  {
    slug: "seventeen-minutes",
    code: "CASE 002",
    title: "Seventeen Minutes",
    premise:
      "The station's reel runs seventeen minutes short on the night its late-show host walked out of the booth and never came back.",
    rank: "senior",
    solveMinutes: 90,
    pages: 31,
    priceBdt: 400,
    tags: ["Missing person", "Audio evidence"],
  },
  {
    slug: "the-ashgate-recital",
    code: "CASE 003",
    title: "The Ashgate Recital",
    premise:
      "Four musicians, one poisoned glass in the interval, and a printed programme that was quietly reset the morning of the concert.",
    rank: "master",
    solveMinutes: 150,
    pages: 46,
    priceBdt: 600,
    tags: ["Poisoning", "Five suspects"],
  },
];

/** Formats a BDT price for display, e.g. `৳ 250`. */
export function formatTaka(amount: number): string {
  return `৳ ${amount.toLocaleString("en-BD")}`;
}

/** Turns 90 into "1h 30m", 45 into "45m". */
export function formatSolveTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}
