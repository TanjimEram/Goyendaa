import "server-only";

import { inBackground } from "@/lib/background";
import { serverEnv } from "@/lib/env";
import type { OrderWithCase } from "@/lib/orders-data";
import { SITE } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Meta Conversions API: the server-side Purchase event.
 *
 * Inert unless the META_CAPI_TOKEN Worker secret is set: no attribution is
 * captured at checkout, nothing is sent, nothing is logged. The browser
 * Pixel (src/components/MetaPixel.tsx) works on its own either way.
 *
 * Purchase is sent once, from approveOrder, after the pending → paid update
 * succeeded — approval is this shop's "payment confirmed". event_id is the
 * order id, so a browser Purchase added later with the same eventID dedupes.
 */

const GRAPH_VERSION = "v26.0"; // Graph API changelog, checked 2026-10-21

export async function metaEnabled(): Promise<boolean> {
  return Boolean(await serverEnv("META_CAPI_TOKEN"));
}

export interface Attribution {
  meta_fbp: string | null;
  meta_fbc: string | null;
  client_ip: string | null;
  client_user_agent: string | null;
}

const NO_ATTRIBUTION: Attribution = { meta_fbp: null, meta_fbc: null, client_ip: null, client_user_agent: null };

/** Stores the checkout-time signals on the order. Best-effort: a missing
 *  migration or a DB hiccup must never break checkout. */
export async function saveAttribution(orderId: string, a: Attribution): Promise<void> {
  if (!(await metaEnabled())) return;
  try {
    const supabase = await createServiceClient();
    await supabase.from("orders").update(a).eq("id", orderId);
  } catch {
    // Attribution is optional; the order itself is already saved.
  }
}

/** Drops the stored IP / user agent / cookies once they've served. */
async function clearAttribution(orderId: string): Promise<void> {
  try {
    const supabase = await createServiceClient();
    await supabase.from("orders").update(NO_ATTRIBUTION).eq("id", orderId);
  } catch {
    // Nothing useful to do; the next approve/reject tries again.
  }
}

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

type PurchaseOrder = OrderWithCase & Partial<Attribution>;

/** The request body Meta expects. Exported for the self-check. */
export async function purchasePayload(order: PurchaseOrder, approvedAt: Date, testEventCode?: string) {
  const email = (order.buyer_email ?? "").trim().toLowerCase();
  const user_data: Record<string, unknown> = {};
  if (email) user_data.em = [await sha256(email)];
  if (order.client_ip) user_data.client_ip_address = order.client_ip;
  if (order.client_user_agent) user_data.client_user_agent = order.client_user_agent;
  if (order.meta_fbp) user_data.fbp = order.meta_fbp;
  if (order.meta_fbc) user_data.fbc = order.meta_fbc;
  return {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(approvedAt.getTime() / 1000),
        event_id: order.id,
        action_source: "website",
        // Where the purchase happened. Never the private /orders/<token> URL.
        event_source_url: `${SITE.url}/checkout/${order.case.slug}`,
        user_data,
        custom_data: {
          value: order.amount, // what the buyer actually paid (no discounts exist)
          currency: "BDT",
          content_ids: [order.case.slug],
          content_type: "product",
          order_id: order.order_code,
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };
}

/** Sends Purchase once; returns Meta's reply for the logs/verification.
 *  One attempt, never retried in a loop. Logs carry no personal data. */
export async function sendPurchase(order: PurchaseOrder, approvedAt: Date): Promise<{ ok: boolean; status: number; body?: unknown }> {
  const token = await serverEnv("META_CAPI_TOKEN");
  if (!token) return { ok: false, status: 0 };
  try {
    const payload = await purchasePayload(order, approvedAt, await serverEnv("META_TEST_EVENT_CODE"));
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${SITE.metaPixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: token }),
    });
    const body = (await res.json().catch(() => ({}))) as { events_received?: number; error?: { code?: number; error_subcode?: number; type?: string } };
    if (!res.ok) {
      const e = body.error ?? {};
      console.error(`[meta] purchase event failed: HTTP ${res.status} ${e.type ?? ""} ${e.code ?? ""}/${e.error_subcode ?? ""}`.trim());
    } else {
      console.log(`[meta] purchase event sent: events_received=${body.events_received ?? "?"}`);
    }
    return { ok: res.ok, status: res.status, body };
  } catch (error) {
    console.error(`[meta] purchase event failed: ${error instanceof Error ? error.name : "network error"}`);
    return { ok: false, status: 0 };
  } finally {
    await clearAttribution(order.id);
  }
}

/** Buyers who asked us (privacy policy §4) not to send their purchases:
 *  the META_OPT_OUT_EMAILS secret, comma-separated. A secret, not code, so
 *  the addresses are never committed. */
async function optedOut(email: string | null): Promise<boolean> {
  const list = (await serverEnv("META_OPT_OUT_EMAILS")) ?? "";
  const e = (email ?? "").trim().toLowerCase();
  return Boolean(e) && list.split(",").some((x) => x.trim().toLowerCase() === e);
}

/** approveOrder's hook: Purchase in the background, if enabled. */
export async function onOrderPaid(order: PurchaseOrder, approvedAt: Date): Promise<void> {
  if (!(await metaEnabled())) return;
  if (await optedOut(order.buyer_email)) return void (await inBackground(clearAttribution(order.id)));
  await inBackground(sendPurchase(order, approvedAt));
}

/** rejectOrder's hook: nothing to send, just drop the stored signals. */
export async function onOrderRejected(orderId: string): Promise<void> {
  if (!(await metaEnabled())) return;
  await inBackground(clearAttribution(orderId));
}
