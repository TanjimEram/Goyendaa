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
  /** One line, for the badge tooltip. */
  tagline: string;
  /** Two or three sentences on what the rank actually demands. */
  description: string;
  /** Human-readable time and suspect ranges for the rank guide. */
  timeRange: string;
  suspects: string;
}

export const RANKS: Record<Rank, RankMeta> = {
  rookie: {
    label: "Rookie Goyenda",
    pips: 1,
    solutionDelayHours: 1,
    tagline: "A first file. One clean contradiction to find.",
    description:
      "One contradiction hides in the paperwork and everything else points at it. A single timeline, a handful of suspects, and no prior cases needed. Good for a first evening, or a table of friends who haven't done this before.",
    timeRange: "40–60 min",
    suspects: "2–3 suspects",
  },
  senior: {
    label: "Senior Goyenda",
    pips: 2,
    solutionDelayHours: 2,
    tagline: "Two threads that only make sense read together.",
    description:
      "The evidence has to be cross-read — a statement against a log, a photograph against a floor plan. Alibis partly hold. You'll need to build a timeline on paper and defend it. Expect one confident wrong turn before the right one.",
    timeRange: "1½–2 hours",
    suspects: "3–4 suspects",
  },
  master: {
    label: "Master Goyenda",
    pips: 3,
    solutionDelayHours: 3,
    tagline: "Every witness is partly lying. The scene has been staged.",
    description:
      "Physical evidence has to be interpreted, not just read. Several witnesses are honest about the wrong things. There is a staged element and at least one deliberate red herring built to survive a first pass. Bring more than one brain.",
    timeRange: "2½–3 hours",
    suspects: "5+ suspects",
  },
};

/** One line of the "what's in the file" list. */
export interface ContentItem {
  label: string;
  /** How many of them, when countable. */
  count?: number;
  detail: string;
}

/**
 * What a case file contains, templated by rank. Real cases will override this
 * with their actual manifest — see `CaseFile.contents`.
 */
export const RANK_CONTENTS: Record<Rank, ContentItem[]> = {
  rookie: [
    { label: "Case brief", detail: "The investigating officer's summary and your assignment." },
    { label: "Witness statements", count: 3, detail: "Signed, dated, and not all of them careful." },
    { label: "Scene photographs", count: 4, detail: "Print in colour if you can. Look at the edges." },
    { label: "Incident log", detail: "The first-responder timeline, hour by hour." },
    { label: "Suspect profiles", count: 3, detail: "Who they are, where they say they were." },
    { label: "Scene map", detail: "A single-page plan of where it happened." },
    { label: "Sealed solution", detail: "Emailed to you 1 hour after purchase. Not in the pack." },
  ],
  senior: [
    { label: "Case brief", detail: "The investigating officer's summary and your assignment." },
    { label: "Witness statements", count: 5, detail: "Two of them describe the same minute differently." },
    { label: "Interrogation transcripts", count: 2, detail: "Verbatim. Pauses are marked." },
    { label: "Scene photographs", count: 6, detail: "Numbered to match the evidence inventory." },
    { label: "Forensic report", detail: "One page of findings, one page of caveats." },
    { label: "Timeline worksheet", detail: "Blank. You build it." },
    { label: "Suspect profiles", count: 4, detail: "Backgrounds, relationships, stated alibis." },
    { label: "Evidence inventory", detail: "Everything bagged at the scene, with locations." },
    { label: "Sealed solution", detail: "Emailed to you 2 hours after purchase. Not in the pack." },
  ],
  master: [
    { label: "Case brief", detail: "The investigating officer's summary and your assignment." },
    { label: "Witness statements", count: 7, detail: "Everyone is honest about something." },
    { label: "Interrogation transcripts", count: 4, detail: "Verbatim, including what was not answered." },
    { label: "Scene photographs", count: 8, detail: "Two were taken before the scene was disturbed. Which two?" },
    { label: "Forensic & toxicology reports", detail: "Findings, timings, and the margins of error." },
    { label: "Phone and CCTV logs", detail: "Partial. Gaps are part of the evidence." },
    { label: "Floor plan", detail: "To scale, with sightlines." },
    { label: "Suspect profiles", count: 5, detail: "Backgrounds, relationships, stated alibis." },
    { label: "Investigator's notebook", detail: "The first detective's working notes. Some are wrong." },
    { label: "Sealed solution", detail: "Emailed to you 3 hours after purchase. Not in the pack." },
  ],
};

export interface CaseFile {
  slug: string;
  /** Printed on the folder tab, e.g. "CASE 001". */
  code: string;
  title: string;
  /** One line. Sets the hook without giving away the mechanism. */
  premise: string;
  /** Two or three sentences for the detail page. Teases; never summarises
   *  the plot or names the mechanism. */
  hook: string;
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
  /** Real manifest for the detail page. Falls back to RANK_CONTENTS[rank]. */
  contents?: ContentItem[];
  /** Headings for the three redacted preview documents. Falls back to a
   *  rank-based default built around `exhibit`. */
  previewDocs?: string[];
}

/** Every published case, in catalogue order (newest last). */
export const ALL_CASES: CaseFile[] = [
  {
    slug: "the-rainhouse-key",
    code: "CASE 001",
    title: "The Rainhouse Key",
    premise:
      "A riverside guesthouse locked from the inside, one key on the table — and a guest who signed out three hours after he died.",
    hook:
      "The Rainhouse takes six guests a night and keeps a register in ink. On the fourteenth, one signature appears twice — once at check-in, and once three hours after the doctor's estimate of death. The key was on the table. The door was bolted from inside. Somebody wants you to believe the register.",
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
    hook:
      "Every night for nine years, the late show ran to the second. The night its host walked out mid-sentence, the station's own tape came back seventeen minutes short, and nobody in the building admits to touching it. Start with who was awake. Then work out who wasn't.",
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
    hook:
      "Four musicians shared a glass of water in the interval; one of them didn't play the second half. The programme in your hands was reprinted that morning. The one that went to the printers the night before said something else. Find out what changed, and who needed it to.",
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
    hook:
      "The strongroom was locked, the accounts balanced to the paisa, and the merchant was inside with the door bolted. One page of the ledger is in a hand that isn't his. It's the neatest page in the book. Someone was careful — but careful about the wrong thing.",
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
    hook:
      "A boat drifts back to the jetty an hour before dawn: nets wet, lamp lit, nobody aboard. The tide tables say it left on the ebb. The silt says two people walked down to it. Only one set of prints comes back.",
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
    hook:
      "Six guests on the fourth floor heard the lift at two in the morning. The lift's maintenance log — stamped, initialled, and kept in a locked drawer — says it never left the ground. Either six people are wrong about the same minute, or the log is. Decide which, and then decide why.",
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
    hook:
      "The greenhouse is kept at twenty-eight degrees and the door is alarmed. The botanist was found among her plants at dawn; the climate chart shows the temperature never moved. Nothing came in, nothing went out. And yet something did.",
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
    hook:
      "Three hundred guests, four cameras, and a groom who is not in a single frame after the ninth course. The family's video skips at 9:41 and again at 9:52 — the exact minutes they say nothing happened. Watch the edges of the frame. Somebody always is.",
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

export function getCaseBySlug(slug: string): CaseFile | undefined {
  return ALL_CASES.find((c) => c.slug === slug);
}

/** The manifest shown on the detail page: real one if authored, else the
 *  rank template. */
export function getCaseContents(caseFile: CaseFile): ContentItem[] {
  return caseFile.contents ?? RANK_CONTENTS[caseFile.rank];
}

/** Headings for the three preview documents. The case's own exhibit leads;
 *  the rest depend on what the rank's pack would actually contain. */
export function getPreviewDocs(caseFile: CaseFile): string[] {
  if (caseFile.previewDocs) return caseFile.previewDocs;
  const third =
    caseFile.rank === "rookie" ? "Incident log" : "Interrogation transcript";
  return [caseFile.exhibit, "Witness statement", third];
}

/** Up to `n` other cases, nearest rank first, for the "other files" row. */
export function getRelatedCases(caseFile: CaseFile, n = 3): CaseFile[] {
  const pips = RANKS[caseFile.rank].pips;
  return ALL_CASES.filter((c) => c.slug !== caseFile.slug)
    .map((c, i) => ({ c, d: Math.abs(RANKS[c.rank].pips - pips), i }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, n)
    .map(({ c }) => c);
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
