"use server";

import { redirect } from "next/navigation";
import { getPublishedCase } from "@/lib/cases-data";
import { adminNewOrderMail, buyerOrderReceivedMail, sendMail } from "@/lib/email";
import { orderEnv } from "@/lib/env";
import { getOrderByIdService, normalizeOrderCode, submitOrder } from "@/lib/orders-data";
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

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Your name, so we can address the email.";
  if (!EMAIL.test(email)) fields.email = "A working email — the download link and the solution go here.";
  if (!TRXID.test(trxid)) fields.trxid = "That doesn't look like a bKash Transaction ID. It's in your confirmation SMS, e.g. BJK7H2X9QT.";

  const order = await getOrderByIdService(orderId);
  if (!order || order.case.slug !== slug) return { error: "This checkout has expired. Go back to the case and start again.", values };
  if (order.status !== "started") {
    // Double submit, or a buyer re-posting an old form.
    redirect(`/orders/${order.access_token}`);
  }
  if (codeTyped !== order.order_code) fields.code = `Type the order code shown above: ${order.order_code}.`;

  if (Object.keys(fields).length) return { fields, values, error: "Fix the fields marked below." };

  const caseFile = await getPublishedCase(slug);
  if (!caseFile) return { error: "That case isn't available any more.", values };

  const saved = await submitOrder(order.id, { buyerName: name, buyerEmail: email, trxId: trxid });

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
