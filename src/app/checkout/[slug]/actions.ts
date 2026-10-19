"use server";

import { redirect } from "next/navigation";
import { getPublishedCase } from "@/lib/cases-data";
import { adminNewOrderMail, buyerOrderReceivedMail, sendMail } from "@/lib/email";
import { orderEnv } from "@/lib/env";
import {
  getOrderByIdService,
  normalizeOrderCode,
  recentSubmissions,
  submitOrder,
  trxidInUse,
} from "@/lib/orders-data";
import { SITE } from "@/lib/site";

export interface CheckoutState {
  error?: string;
  fields?: Record<string, string>;
  /** Echoed so the form keeps what the buyer typed after a validation miss. */
  values?: { name?: string; email?: string; trxid?: string; code?: string };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// bKash TrxIDs are 10 upper-case alphanumerics (e.g. BJK7H2X9QT). Allow a
// little slack either side in case the format shifts.
const TRXID = /^[A-Z0-9]{6,20}$/;

// Abuse brakes. Each submission emails the admin and the address typed in,
// so a script hammering the form would flood the inbox and burn the email
// provider's daily quota. Generous for real buyers.
const MAX_PER_EMAIL_PER_HOUR = 3;
const MAX_TOTAL_PER_10_MIN = 20;

const UNAVAILABLE =
  "We couldn't reach our order system just now. Your payment details are safe with you — try again in a minute, or message us with your TrxID.";

export async function submitManualPayment(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const orderId = String(formData.get("order_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const trxid = String(formData.get("trxid") ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const codeTyped = normalizeOrderCode(String(formData.get("code") ?? ""));
  const values = { name, email, trxid, code: String(formData.get("code") ?? "") };

  // Honeypot filled in: a bot. Say nothing useful, save nothing.
  if (String(formData.get("website") ?? "")) return { error: UNAVAILABLE, values };

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Your name, so we can address the email.";
  if (!EMAIL.test(email)) fields.email = "A working email — the download link and the solution go here.";
  if (!TRXID.test(trxid)) fields.trxid = "That doesn't look like a bKash Transaction ID. It's in your confirmation SMS, e.g. BJK7H2X9QT.";

  let order;
  try {
    order = await getOrderByIdService(orderId);
  } catch (error) {
    console.error("[checkout] order lookup failed", error);
    return { error: UNAVAILABLE, values };
  }
  if (!order || order.case.slug !== slug) return { error: "This checkout has expired. Go back to the case and start again.", values };
  if (order.status !== "started") {
    // Double submit, or a buyer re-posting an old form.
    redirect(`/orders/${order.access_token}`);
  }
  if (codeTyped !== order.order_code) fields.code = `Type the order code shown above: ${order.order_code}.`;

  if (Object.keys(fields).length) return { fields, values, error: "Fix the fields marked below." };

  let saved;
  let caseFile;
  try {
    caseFile = await getPublishedCase(slug);
    if (!caseFile) return { error: "That case isn't available any more.", values };

    // One bKash payment pays for one order.
    if (await trxidInUse(trxid, order.id)) {
      return {
        fields: { trxid: "This Transaction ID is already attached to another order. Check the SMS, or message us if you think this is a mistake." },
        values,
        error: "Fix the fields marked below.",
      };
    }
    if (
      (await recentSubmissions(60, email)) >= MAX_PER_EMAIL_PER_HOUR ||
      (await recentSubmissions(10)) >= MAX_TOTAL_PER_10_MIN
    ) {
      return { error: "Too many orders in a short time. Wait a few minutes and try again, or message us.", values };
    }

    saved = await submitOrder(order.id, { buyerName: name, buyerEmail: email, trxId: trxid });
  } catch (error) {
    // A double submit that lost the race finds the order already pending:
    // send this click to the same order page instead of an error.
    const now = await getOrderByIdService(order.id).catch(() => null);
    if (now && now.status !== "started") redirect(`/orders/${now.access_token}`);
    console.error("[checkout] submit failed", error);
    return { error: UNAVAILABLE, values };
  }

  // Emails are best-effort: a failed send must never block the order.
  const { adminEmail } = await orderEnv();
  const info = {
    orderCode: saved.order_code,
    buyerName: name,
    buyerEmail: email,
    caseTitle: caseFile.title,
    caseCode: caseFile.code,
    amount: saved.amount,
    trxId: trxid,
    statusUrl: `${SITE.url}/orders/${saved.access_token}`,
  };
  await Promise.allSettled([
    sendMail({ to: adminEmail, ...adminNewOrderMail(info, `${SITE.url}/admin/orders`) }),
    sendMail({ to: email, ...buyerOrderReceivedMail(info, SITE.confirmationWindow) }),
  ]);

  redirect(`/orders/${saved.access_token}`);
}
