import Link from "next/link";
import { DifficultyBadge } from "@/components/CaseCard";
import {
  RANKS,
  defaultDeliveryInfo,
  defaultPurchaseInfo,
  formatSolveTime,
  formatTaka,
  toLines,
  type CaseFile,
} from "@/lib/cases";

/** Purchase + delivery bullets, falling back to the rank defaults. */
export function buyingLines(caseFile: CaseFile): string[] {
  const purchase = toLines(caseFile.purchaseInfo);
  const delivery = toLines(caseFile.deliveryInfo);
  return [
    ...(purchase.length ? purchase : toLines(defaultPurchaseInfo())),
    ...(delivery.length ? delivery : toLines(defaultDeliveryInfo(caseFile.rank))),
  ];
}

/** Where "Buy case file" goes — the manual bKash checkout. */
export function checkoutHref(caseFile: CaseFile) {
  return `/checkout/${caseFile.slug}`;
}

const BUY_BUTTON =
  "group inline-flex items-center justify-center gap-3 bg-blood px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp";

/**
 * The buy box. Sticky beside the content on large screens; on small screens
 * the page uses <PurchaseBar> instead, pinned to the bottom of the viewport.
 */
export function PurchasePanel({ caseFile }: { caseFile: CaseFile }) {
  const rank = RANKS[caseFile.rank];

  return (
    <aside
      aria-label="Buy this case"
      className="border border-noir-line bg-noir-raised p-6 lg:sticky lg:top-24 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
            Case file
          </p>
          <p className="mt-1 font-display text-4xl text-brass">
            {formatTaka(caseFile.priceBdt)}
          </p>
        </div>
        <DifficultyBadge rank={caseFile.rank} />
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-noir-line py-4 font-mono text-[10px] uppercase tracking-[0.14em]">
        <div>
          <dt className="text-ash">Solve time</dt>
          <dd className="mt-1 text-cream">
            ~{formatSolveTime(caseFile.solveMinutes)}
          </dd>
        </div>
        <div>
          <dt className="text-ash">Pages</dt>
          <dd className="mt-1 text-cream">{caseFile.pages}</dd>
        </div>
        <div>
          <dt className="text-ash">Solution</dt>
          <dd className="mt-1 text-cream">+{rank.solutionDelayHours}h</dd>
        </div>
      </dl>

      <Link href={checkoutHref(caseFile)} className={`${BUY_BUTTON} mt-6 w-full`}>
        Buy case file
        <span
          aria-hidden
          className="transition-transform duration-300 ease-noir group-hover:translate-x-1"
        >
          &rarr;
        </span>
      </Link>

      <ul className="mt-5 flex flex-col gap-2 text-xs leading-[1.6] text-ash">
        {buyingLines(caseFile).map((line) => (
          <li key={line} className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 bg-brass" aria-hidden />
            {line}
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-noir-line pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
        Pay with{" "}
        <span className="text-brass-dim">bKash &middot; Nagad &middot; Card</span>
      </p>
    </aside>
  );
}

/** Bottom-pinned buy bar for phones. Hidden from `lg` up, where the panel
 *  is in view beside the content. */
export function PurchaseBar({ caseFile }: { caseFile: CaseFile }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-noir-line bg-noir/90 px-5 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            {caseFile.code} &middot; {RANKS[caseFile.rank].label}
          </p>
          <p className="font-display text-2xl leading-none text-brass">
            {formatTaka(caseFile.priceBdt)}
          </p>
        </div>
        <Link
          href={checkoutHref(caseFile)}
          className={`${BUY_BUTTON} shrink-0 px-5 py-3`}
        >
          Buy
          <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
