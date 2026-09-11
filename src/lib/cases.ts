/**
 * Placeholder case data for the homepage teaser row and the /cases catalog.
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
  /** Which document the card's preview pretends to be, e.g. "Witness statement".
   *  Purely cosmetic until real thumbnails exist. */
  exhibit: string;
  /** Path to a real page thumbnail (public/ or Supabase storage URL). When
   *  absent the card renders the generated redacted-document preview. */
  thumbnail?: string;
  /** Shown on the homepage teaser row. */
  featured?: boolean;
}

/** Every published case, in catalogue order (newest last). */
export const ALL_CASES: CaseFile[] = [
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
    exhibit: "Guest register",
    featured: true,
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
    exhibit: "Broadcast log",
    featured: true,
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
    exhibit: "Toxicology note",
    featured: true,
  },
  {
    slug: "the-ledger-at-nolpur",
    code: "CASE 004",
    title: "The Ledger at Nolpur",
    premise:
      "A jute merchant is found in his own strongroom with the books balanced to the paisa — except for one page written in a hand that isn't his.",
    rank: "rookie",
    solveMinutes: 50,
    pages: 20,
    priceBdt: 250,
    tags: ["Forgery", "Three suspects"],
    exhibit: "Account ledger",
  },
  {
    slug: "low-tide-at-charkhali",
    code: "CASE 005",
    title: "Low Tide at Charkhali",
    premise:
      "A fisherman's boat drifts back to the jetty with the nets still wet, the lamp still lit, and a second set of footprints in the silt.",
    rank: "senior",
    solveMinutes: 100,
    pages: 34,
    priceBdt: 400,
    tags: ["Drowning", "Tide tables"],
    exhibit: "Coastguard report",
  },
  {
    slug: "the-night-porter",
    code: "CASE 006",
    title: "The Night Porter",
    premise:
      "Every guest on the fourth floor swears they heard the lift at 2 a.m. The lift's own log says it never left the ground.",
    rank: "senior",
    solveMinutes: 85,
    pages: 29,
    priceBdt: 400,
    tags: ["Hotel", "Contradicting witnesses"],
    exhibit: "Lift maintenance log",
  },
  {
    slug: "the-orchid-house",
    code: "CASE 007",
    title: "The Orchid House",
    premise:
      "A botanist dies among her plants in a greenhouse kept at exactly 28 degrees — and the thermometer says it was never opened.",
    rank: "master",
    solveMinutes: 160,
    pages: 48,
    priceBdt: 600,
    tags: ["Sealed room", "Scientific evidence"],
    exhibit: "Greenhouse climate chart",
  },
  {
    slug: "a-wedding-in-shantinagar",
    code: "CASE 008",
    title: "A Wedding in Shantinagar",
    premise:
      "Three hundred guests, one missing groom, and a wedding video that skips exactly where the family says nothing happened.",
    rank: "rookie",
    solveMinutes: 40,
    pages: 16,
    priceBdt: 250,
    tags: ["Missing person", "Video evidence"],
    exhibit: "Guest list",
  },
];

/** The homepage teaser row. Derived, so the two lists can't drift apart. */
export const FEATURED_CASES: CaseFile[] = ALL_CASES.filter((c) => c.featured);

/** Catalogue rank order, used for the filter bar and difficulty sort. */
export const RANK_ORDER: Rank[] = ["rookie", "senior", "master"];

export function isRank(value: unknown): value is Rank {
  return typeof value === "string" && value in RANKS;
}

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
