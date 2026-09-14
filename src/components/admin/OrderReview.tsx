"use client";

import { useActionState, useState } from "react";
import { approveOrder, rejectOrder, type OrderActionState } from "@/app/admin/(dashboard)/orders/actions";
import { CopyButton } from "@/components/CopyButton";
import { RANKS, formatTaka, type Rank } from "@/lib/cases";
import { formatDateTimeBD } from "@/lib/orders";

export interface PendingOrderItem {
  id: string;
  order_code: string;
  buyer_name: string;
  buyer_email: string;
  amount: number;
  submitted_trxid: string;
  submitted_at: string;
  case_title: string;
  case_code: string;
  case_rank: Rank;
  has_pdf: boolean;
}

const BTN = "px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-50";

/**
 * One pending order, laid out for cross-checking against the bKash app:
 * the amount and TrxID are the two things to match, so they're biggest.
 */
export function OrderReview({ order }: { order: PendingOrderItem }) {
  const [approveState, approve, approving] = useActionState<OrderActionState, FormData>(approveOrder, {});
  const [rejectState, reject, rejecting] = useActionState<OrderActionState, FormData>(rejectOrder, {});
  const [rejectOpen, setRejectOpen] = useState(false);
  const busy = approving || rejecting;
  const msg = approveState.error ?? rejectState.error;
  const warn = approveState.warning;

  return (
    <li className="border border-noir-line bg-noir-raised">
      <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-start">
        {/* Match these two against bKash */}
        <div className="flex gap-6 md:flex-col md:gap-3 md:border-r md:border-noir-line md:pr-6">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash">Amount</p>
            <p className="font-display text-3xl text-brass">{formatTaka(order.amount)}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash">TrxID</p>
            <p className="flex items-center gap-2 font-mono text-lg tracking-[0.1em] text-cream">
              {order.submitted_trxid}
              <CopyButton value={order.submitted_trxid} />
            </p>
          </div>
        </div>

        {/* Context */}
        <div className="min-w-0 text-sm">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[12px] tracking-[0.12em] text-brass">{order.order_code}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
              {formatDateTimeBD(order.submitted_at)}
            </span>
          </p>
          <p className="mt-2 text-cream">
            {order.buyer_name}{" "}
            <span className="text-ash">&middot; {order.buyer_email}</span>
          </p>
          <p className="mt-1 text-ash">
            {order.case_code} &middot; {order.case_title} &middot;{" "}
            <span className="text-brass">{RANKS[order.case_rank].label}</span> (+
            {RANKS[order.case_rank].solutionDelayHours}h)
          </p>
          {!order.has_pdf && (
            <p className="mt-2 border-l-2 border-blood pl-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cream">
              No case PDF uploaded &mdash; approve will be blocked
            </p>
          )}
        </div>

        {/* Decisions */}
        <div className="flex flex-col items-stretch gap-2 md:w-44">
          <form action={approve}>
            <input type="hidden" name="id" value={order.id} />
            <button
              type="submit"
              disabled={busy || !order.has_pdf}
              className={`${BTN} w-full bg-brass text-noir hover:bg-cream`}
            >
              {approving ? "Approving…" : "Approve"}
            </button>
          </form>
          {!rejectOpen ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setRejectOpen(true)}
              className={`${BTN} border border-noir-line text-ash hover:border-blood hover:text-cream`}
            >
              Reject…
            </button>
          ) : (
            <form action={reject} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={order.id} />
              <input
                name="reason"
                required
                minLength={3}
                maxLength={300}
                autoFocus
                placeholder="Reason (required)"
                className="w-full border border-noir-line bg-noir px-3 py-2 font-sans text-xs text-cream outline-none placeholder:text-ash/60 focus:border-brass"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className={`${BTN} flex-1 bg-blood text-cream hover:bg-blood-hot`}>
                  {rejecting ? "Rejecting…" : "Confirm reject"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setRejectOpen(false)}
                  className={`${BTN} border border-noir-line text-ash hover:text-cream`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {(msg || warn) && (
        <p
          role="alert"
          className={`border-t px-5 py-3 font-mono text-[11px] ${
            warn ? "border-brass/40 bg-brass/10 text-cream" : "border-blood/40 bg-blood/10 text-cream"
          }`}
        >
          {msg ?? warn}
        </p>
      )}
    </li>
  );
}
