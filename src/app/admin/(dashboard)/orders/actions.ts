"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buyerOrderApprovedMail, sendMail } from "@/lib/email";
import { RANKS } from "@/lib/cases";
import { formatDateTimeBD } from "@/lib/orders";
import { getOrderByIdAdmin, solutionSendAt } from "@/lib/orders-data";
import { SITE } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export interface OrderActionState {
  error?: string;
  /** Set when the order changed state but the buyer email didn't go out. */
  warning?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");
  return supabase;
}

function refresh() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/history");
  revalidatePath("/admin");
}

/**
 * Marks the order paid, stamps approved_at, computes solution_send_at from
 * the case's rank delay at THIS moment, and emails the buyer their link.
 */
export async function approveOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const order = await getOrderByIdAdmin(id);
  if (!order) return { error: "Order not found." };
  if (order.status !== "pending") return { error: `Order is already ${order.status}.` };
  if (!order.case.case_pdf_path) {
    return { error: `${order.case.title} has no case PDF uploaded. Add it on the case's edit page first.` };
  }

  const approvedAt = new Date();
  const sendAt = solutionSendAt(order.case.difficulty_rank, approvedAt);

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      approved_at: approvedAt.toISOString(),
      solution_send_at: sendAt.toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { error: error.message };

  refresh();

  const rank = RANKS[order.case.difficulty_rank];
  const mail = buyerOrderApprovedMail(
    {
      orderCode: order.order_code,
      buyerName: order.buyer_name ?? "",
      buyerEmail: order.buyer_email ?? "",
      caseTitle: order.case.title,
      caseCode: `CASE ${String(order.case.case_number).padStart(3, "0")}`,
      amount: order.amount,
      trxId: order.submitted_trxid ?? "",
      statusUrl: `${SITE.url}/orders/${order.access_token}`,
    },
    {
      downloadUrl: `${SITE.url}/orders/${order.access_token}`,
      solutionAtText: formatDateTimeBD(sendAt.toISOString()),
      solutionDelayHours: rank.solutionDelayHours,
      downloadWindowDays: SITE.downloadWindowDays,
    },
  );
  const sent = await sendMail({ to: order.buyer_email ?? "", ...mail });
  if (!sent.ok) {
    return {
      warning: `Approved, but the email to ${order.buyer_email} failed (${sent.error}). Send them ${SITE.url}/orders/${order.access_token} by hand.`,
    };
  }
  return {};
}

/** Marks the order rejected with a reason. No buyer email (by design, for now). */
export async function rejectOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);

  if (reason.length < 3) return { error: "Give a short reason — it's stored with the order." };

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "rejected", rejection_reason: reason, rejected_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Order wasn't pending — nothing changed." };

  refresh();
  return {};
}
