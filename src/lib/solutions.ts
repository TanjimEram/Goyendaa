import "server-only";

import { RANKS } from "@/lib/cases";
import { adminSolutionFailedMail, buyerSolutionMail, sendMail } from "@/lib/email";
import { orderEnv } from "@/lib/env";
import {
  getDueSolutionOrders,
  markSolutionFailed,
  markSolutionSent,
  type OrderWithCase,
} from "@/lib/orders-data";
import { SITE } from "@/lib/site";

export interface SolutionRunResult {
  due: number;
  sent: string[];
  failed: { order: string; reason: string }[];
}

function mailInfo(o: OrderWithCase) {
  return {
    orderCode: o.order_code,
    buyerName: o.buyer_name ?? "",
    buyerEmail: o.buyer_email ?? "",
    caseTitle: o.case.title,
    caseCode: `CASE ${String(o.case.case_number).padStart(3, "0")}`,
    amount: o.amount,
    trxId: o.submitted_trxid ?? "",
    statusUrl: `${SITE.url}/orders/${o.access_token}`,
  };
}

/**
 * One pass of the delayed-solution job: every paid order whose
 * `solution_send_at` has arrived gets the sealed solution emailed to the
 * buyer, then is marked sent.
 *
 * Idempotent by design — `solution_sent` is the flag, so a double run (or
 * a retry after a crash) never mails twice, and a failure leaves the row
 * due for the next tick until the attempt cap.
 */
export async function sendDueSolutions(limit = 25): Promise<SolutionRunResult> {
  const orders = await getDueSolutionOrders(limit);
  const result: SolutionRunResult = { due: orders.length, sent: [], failed: [] };

  for (const order of orders) {
    const reason = await deliver(order);
    if (reason) {
      result.failed.push({ order: order.order_code, reason });
      await markSolutionFailed(order.id, order.solution_attempts, reason);
      // Tell the admin once, on the first failure, so it isn't silent.
      if (order.solution_attempts === 0) await alertAdmin(order, reason);
    } else {
      result.sent.push(order.order_code);
      await markSolutionSent(order.id, order.solution_attempts);
    }
  }

  return result;
}

/** Returns a failure reason, or undefined when the mail went out. */
async function deliver(order: OrderWithCase): Promise<string | undefined> {
  if (!order.buyer_email) return "no buyer email on the order";
  if (!order.case.solution_pdf_path) {
    return `${order.case.title} has no solution PDF uploaded`;
  }

  const sent = await sendMail({
    to: order.buyer_email,
    ...buyerSolutionMail(mailInfo(order), {
      solutionUrl: `${SITE.url}/orders/${order.access_token}/solution`,
      heldHours: RANKS[order.case.difficulty_rank].solutionDelayHours,
    }),
  });
  return sent.ok ? undefined : (sent.error ?? "email send failed");
}

async function alertAdmin(order: OrderWithCase, reason: string): Promise<void> {
  try {
    const { adminEmail } = await orderEnv();
    await sendMail({
      to: adminEmail,
      ...adminSolutionFailedMail(mailInfo(order), reason, `${SITE.url}/admin/orders`),
    });
  } catch (error) {
    console.error("[solutions] admin alert failed", error);
  }
}
