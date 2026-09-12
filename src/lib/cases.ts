/**
 * Case types, difficulty-rank config and pure helpers.
 *
 * Nothing in here touches the network, so it is safe to import from client
 * components. Case *data* comes from Supabase via `src/lib/cases-data.ts`
 * (server-only); the seed for the eight placeholder cases lives in
 * `supabase/seed.sql`.
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
  /** Database id. Absent only for hand-built fixtures. */
  id?: string;
  slug: string;
  /** Printed on the folder tab, e.g. "CASE 001". Derived from the stable
   *  `case_number` column, not from `position`, so reordering never
   *  renumbers a file. */
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
  /** Which document the card's generated preview pretends to be. Only
   *  used when there is no `thumbnail`. */
  exhibit?: string;
  /** Public URL of the card thumbnail. When absent the card renders the
   *  generated redacted-document preview. */
  thumbnail?: string;
  /** Public URLs of preview/gallery images for the detail page, in order.
   *  When empty the detail page renders generated redacted documents. */
  gallery?: string[];
  /** Shown on the homepage teaser row. */
  featured?: boolean;
  /** Real manifest for the detail page. Falls back to RANK_CONTENTS[rank]. */
  contents?: ContentItem[];
  /** Headings for the three redacted preview documents. Falls back to a
   *  rank-based default built around `exhibit`. */
  previewDocs?: string[];
  /** "How to buy" copy. Empty → defaultPurchaseInfo(). */
  purchaseInfo?: string;
  /** "How and when the solution arrives" copy. Empty → defaultDeliveryInfo(rank). */
  deliveryInfo?: string;
  /** e.g. "Best with 2–4 people." */
  playerNote?: string;
  /** Themes / content warning. */
  contentNote?: string;
}

// ── Editorial defaults ───────────────────────────────────────────────
// One line per bullet. The admin form prefills these so the wording is
// editable per case, and the site falls back to them when a case's copy
// is blank.

export function defaultPurchaseInfo(): string {
  return [
    "Pay with bKash, Nagad or card. No account needed.",
    "The case-file PDF downloads the moment payment clears. Print at home, A4.",
    "One purchase, unlimited reprints — play it with as many people as you like.",
  ].join("\n");
}

export function defaultDeliveryInfo(rank: Rank): string {
  const h = RANKS[rank].solutionDelayHours;
  return [
    `The solution is emailed ${h} hour${h === 1 ? "" : "s"} after purchase — not with the download, so you can't peek.`,
    "It goes to the email address you pay with. Check spam if it hasn't arrived on time.",
  ].join("\n");
}

/** Splits admin-entered copy into non-empty trimmed lines. */
export function toLines(text: string | undefined | null): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Parses the admin's "what's in the file" textarea, one item per line:
 *   3 × Witness statements — Signed, dated, and not all of them careful.
 *   Case brief — The investigating officer's summary.
 *   Scene map
 * Accepts "×", "x" or "*" as the multiplier and "—", "–" or " - " as the
 * separator. Lines without a detail get an empty one.
 */
export function parseContentsText(text: string): ContentItem[] {
  return toLines(text).map((line) => {
    let rest = line;
    let count: number | undefined;
    const m = rest.match(/^(\d+)\s*[×x*]\s*/i);
    if (m) {
      count = Number.parseInt(m[1], 10);
      rest = rest.slice(m[0].length);
    }
    const sep = rest.search(/\s+[—–-]\s+|\s*—\s*/);
    const label = (sep === -1 ? rest : rest.slice(0, sep)).trim();
    const detail = sep === -1 ? "" : rest.slice(sep).replace(/^\s*[—–-]\s*/, "").trim();
    return count ? { label, count, detail } : { label, detail };
  }).filter((i) => i.label);
}

/** Inverse of parseContentsText, for prefilling the textarea. */
export function contentsToText(items: ContentItem[]): string {
  return items
    .map((i) => `${i.count ? `${i.count} × ` : ""}${i.label}${i.detail ? ` — ${i.detail}` : ""}`)
    .join("\n");
}

/** Catalogue rank order, used for the filter bar and difficulty sort. */
export const RANK_ORDER: Rank[] = ["rookie", "senior", "master"];

export function isRank(value: unknown): value is Rank {
  return typeof value === "string" && value in RANKS;
}

/** The manifest shown on the detail page: real one if authored, else the
 *  rank template. */
export function getCaseContents(caseFile: CaseFile): ContentItem[] {
  return caseFile.contents?.length ? caseFile.contents : RANK_CONTENTS[caseFile.rank];
}

/** Headings for the three generated preview documents (used only when the
 *  case has no gallery images). The case's own exhibit leads; the rest
 *  depend on what the rank's pack would actually contain. */
export function getPreviewDocs(caseFile: CaseFile): string[] {
  if (caseFile.previewDocs) return caseFile.previewDocs;
  const third =
    caseFile.rank === "rookie" ? "Incident log" : "Interrogation transcript";
  return [caseFile.exhibit ?? "Case brief", "Witness statement", third];
}

/** Up to `n` other cases from `pool`, nearest rank first, for the "other
 *  files" row. */
export function getRelatedCases(
  caseFile: CaseFile,
  pool: CaseFile[],
  n = 3,
): CaseFile[] {
  const pips = RANKS[caseFile.rank].pips;
  return pool
    .filter((c) => c.slug !== caseFile.slug)
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
