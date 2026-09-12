import { RANKS, type CaseFile } from "@/lib/cases";
import type { PaymentMethod } from "@/lib/payments";

/**
 * An order as the success page needs it. This is the shape the future
 * `orders` table row maps to — keep it stable so the page survives the
 * switch from mock to real data unchanged.
 */
export interface Order {
  /** Short human reference printed on the receipt, e.g. GY-7K3Q-M2. */
  ref: string;
  caseSlug: string;
  email: string;
  method: PaymentMethod;
  /** BDT, whole taka. */
  amount: number;
  /** ISO timestamp of payment confirmation — the delivery clock starts here. */
  paidAt: string;
  /** ISO timestamp the solution email is scheduled for. */
  solutionAt: string;
  /** Whether the solution has already been sent. */
  solutionSent: boolean;
}

/** Delivery is scheduled from *payment* time, never download time. */
export function solutionTimeFor(caseFile: CaseFile, paidAt: Date): Date {
  const hours = RANKS[caseFile.rank].solutionDelayHours;
  return new Date(paidAt.getTime() + hours * 60 * 60 * 1000);
}

/**
 * PLACEHOLDER. Builds a plausible order for the design preview. Replace
 * with a lookup by order ref once orders are persisted.
 */
export function mockOrder(caseFile: CaseFile): Order {
  const paidAt = new Date(Date.now() - 4 * 60 * 1000); // paid 4 minutes ago
  return {
    ref: "GY-7K3Q-M2",
    caseSlug: caseFile.slug,
    email: "you@example.com",
    method: "bkash",
    amount: caseFile.priceBdt,
    paidAt: paidAt.toISOString(),
    solutionAt: solutionTimeFor(caseFile, paidAt).toISOString(),
    solutionSent: false,
  };
}

const DHAKA = "Asia/Dhaka";

/** "9:42 PM" in Bangladesh time. */
export function formatTimeBD(iso: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: DHAKA,
  }).format(new Date(iso));
}

/** "12 Sep 2026, 6:42 PM" in Bangladesh time. */
export function formatDateTimeBD(iso: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DHAKA,
  }).format(new Date(iso));
}
