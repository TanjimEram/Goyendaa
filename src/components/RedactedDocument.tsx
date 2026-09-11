/**
 * A full-size redacted document mock for the case-detail preview strip.
 * Built from divs — no image asset — so it stays crisp at any size and
 * costs nothing to load. When real page scans exist this becomes an
 * <Image> behind the same frame and stamp; the frame is the part worth
 * keeping.
 *
 * Three layouts so a row of previews reads as three different papers:
 *   form        — labelled fields, like a register or log
 *   statement   — paragraphs with names blacked out
 *   transcript  — Q / A lines
 */

import Image from "next/image";

type Variant = "form" | "statement" | "transcript";

/** Tailwind width classes, chosen per variant so line lengths look typed
 *  rather than generated. Widths are literal so Tailwind can see them. */
const STATEMENT_LINES = [
  "w-full",
  "w-11/12",
  "w-full",
  "w-4/5",
  "w-full",
  "w-2/3",
  "w-full",
  "w-11/12",
  "w-3/5",
];

function Line({ w, dim }: { w: string; dim?: boolean }) {
  return <div className={`h-1.5 ${w} ${dim ? "bg-cream/10" : "bg-cream/18"}`} />;
}

function Redaction({ w }: { w: string }) {
  return <span className={`redacted inline-block h-2.5 ${w} align-middle`} />;
}

function FormBody() {
  const rows: [string, "text" | "redact"][] = [
    ["w-1/4", "text"],
    ["w-1/3", "redact"],
    ["w-1/5", "text"],
    ["w-1/4", "redact"],
    ["w-1/3", "text"],
    ["w-2/5", "text"],
    ["w-1/4", "redact"],
    ["w-1/5", "text"],
  ];
  return (
    <div className="mt-5 flex flex-col divide-y divide-noir-line/70 border-y border-noir-line/70">
      {rows.map(([w, kind], i) => (
        <div key={i} className="flex items-center gap-4 py-2.5">
          <div className="h-1.5 w-16 shrink-0 bg-brass-dim/60" />
          {kind === "redact" ? <Redaction w={w} /> : <Line w={w} />}
        </div>
      ))}
    </div>
  );
}

function StatementBody() {
  return (
    <div className="mt-5 flex flex-col gap-[7px]">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1/5 bg-cream/18" />
        <Redaction w="w-24" />
        <div className="h-1.5 w-1/4 bg-cream/18" />
      </div>
      {STATEMENT_LINES.slice(0, 4).map((w, i) => (
        <Line key={i} w={w} />
      ))}
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1/3 bg-cream/18" />
        <Redaction w="w-16" />
        <div className="h-1.5 w-1/6 bg-cream/18" />
      </div>
      {STATEMENT_LINES.slice(4).map((w, i) => (
        <Line key={i} w={w} />
      ))}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 w-1/6 bg-cream/18" />
        <Redaction w="w-20" />
      </div>
      <div className="h-1.5 w-1/2 bg-cream/18" />
    </div>
  );
}

function TranscriptBody() {
  const lines: [string, string, boolean][] = [
    ["Q", "w-3/4", false],
    ["A", "w-1/2", true],
    ["Q", "w-2/3", false],
    ["A", "w-11/12", false],
    ["A", "w-1/3", true],
    ["Q", "w-4/5", false],
    ["A", "w-1/4", false],
    ["Q", "w-3/5", false],
    ["A", "w-full", false],
  ];
  return (
    <div className="mt-5 flex flex-col gap-[9px]">
      {lines.map(([who, w, redact], i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-4 shrink-0 font-mono text-[10px] text-brass-dim">
            {who}
          </span>
          {redact ? <Redaction w={w} /> : <Line w={w} dim={who === "A"} />}
        </div>
      ))}
    </div>
  );
}

const BODIES: Record<Variant, () => React.JSX.Element> = {
  form: FormBody,
  statement: StatementBody,
  transcript: TranscriptBody,
};

/** Pick a layout from a heading, e.g. "Witness statement" → statement. */
export function variantFor(heading: string): Variant {
  const h = heading.toLowerCase();
  if (h.includes("transcript") || h.includes("interview")) return "transcript";
  if (h.includes("statement") || h.includes("note") || h.includes("brief"))
    return "statement";
  return "form";
}

export function RedactedDocument({
  heading,
  code,
  index,
  variant = variantFor(heading),
  imageSrc,
}: {
  heading: string;
  /** Case code, printed in the document's corner. */
  code: string;
  /** 0-based position in the strip; sets the exhibit letter and tilt. */
  index: number;
  variant?: Variant;
  /** A real (already redacted) page image. When set, replaces the generated
   *  body; the frame and PREVIEW stamp stay. */
  imageSrc?: string;
}) {
  const Body = BODIES[variant];
  const letter = String.fromCharCode(65 + index); // A, B, C …
  // Alternate a slight tilt so the strip reads as papers on a board.
  const tilt = ["-rotate-[1.2deg]", "rotate-[0.8deg]", "-rotate-[0.6deg]"][
    index % 3
  ];

  return (
    <figure
      className={`relative border border-noir-line bg-noir-raised p-5 transition-transform duration-300 ease-noir hover:rotate-0 sm:p-6 ${tilt}`}
    >
      <figcaption className="flex items-baseline justify-between gap-3 border-b border-noir-line pb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Exhibit {letter} &middot; {heading}
        </span>
        <span className="shrink-0 font-mono text-[9px] tracking-[0.16em] whitespace-nowrap text-ash">
          {code}
        </span>
      </figcaption>

      {imageSrc ? (
        <div className="relative mt-4 aspect-[3/4] w-full overflow-hidden bg-noir">
          <Image
            src={imageSrc}
            alt={`${heading} — redacted preview page`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div aria-hidden>
          <Body />
        </div>
      )}

      {/* Preview stamp — tells the buyer this is a sample, not the file. */}
      <span
        aria-hidden
        className="absolute -right-2 bottom-5 rotate-[-8deg] border-[3px] border-blood px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-blood sm:right-4"
      >
        PREVIEW
      </span>
    </figure>
  );
}
