import "server-only";

import { RANKS, type Rank } from "@/lib/cases";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type OrderStatus = "started" | "pending" | "paid" | "rejected";

/** One row of `public.orders`. */
export interface OrderRow {
  id: string;
  order_code: string;
  access_token: string;
  checkout_session: string | null;
  case_id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  amount: number;
  submitted_trxid: string | null;
  status: OrderStatus;
  rejection_reason: string | null;
  solution_send_at: string | null;
  solution_sent: boolean;
  solution_sent_at: string | null;
  solution_attempts: number;
  solution_error: string | null;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
}

/** Order joined with the bits of its case the UI needs. */
export interface OrderWithCase extends OrderRow {
  case: {
    id: string;
    case_number: number;
    slug: string;
    title: string;
    difficulty_rank: Rank;
    case_pdf_path: string | null;
    solution_pdf_path: string | null;
  };
}

const CASE_JOIN =
  "case:cases(id, case_number, slug, title, difficulty_rank, case_pdf_path, solution_pdf_path)";

// ── Order codes ─────────────────────────────────────────────────────────

/** GYD-4821. Four digits gives 9,000 codes; widen `digits` when the shop
 *  outgrows that (the DB check allows 4–6). */
function randomOrderCode(digits = 4): string {
  const min = 10 ** (digits - 1);
  const span = 10 ** digits - min;
  const n = min + Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * span);
  return `GYD-${n}`;
}

/** Accepts "gyd4821", "GYD 4821", "4821" → "GYD-4821". */
export function normalizeOrderCode(input: string): string {
  const digits = input.replace(/[^0-9]/g, "");
  return digits ? `GYD-${digits}` : "";
}

// ── Public checkout (service role — RLS gives anon nothing) ─────────────

/**
 * Finds the open reservation for this session+case, or creates one. The
 * order code is therefore fixed before the buyer sends any money.
 */
export async function findOrCreateStartedOrder(
  checkoutSession: string,
  caseId: string,
  amount: number,
): Promise<OrderRow> {
  const supabase = await createServiceClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("*")
    .eq("checkout_session", checkoutSession)
    .eq("case_id", caseId)
    .eq("status", "started")
    .maybeSingle();
  if (existing) return existing as OrderRow;

  // Retry on code collision; fall back to a wider code if 4 digits are crowded.
  for (let attempt = 0; attempt < 8; attempt++) {
    const order_code = randomOrderCode(attempt < 5 ? 4 : 5);
    const { data, error } = await supabase
      .from("orders")
      .insert({ order_code, checkout_session: checkoutSession, case_id: caseId, amount })
      .select("*")
      .single();
    if (!error) return data as OrderRow;
    const unique = error.code === "23505";
    if (!unique) throw error;
    // Unique on (session, case) means a concurrent request won the race.
    if (error.message.includes("orders_started_session_case_idx")) {
      const { data: raced } = await supabase
        .from("orders")
        .select("*")
        .eq("checkout_session", checkoutSession)
        .eq("case_id", caseId)
        .eq("status", "started")
        .maybeSingle();
      if (raced) return raced as OrderRow;
    }
    // else: order_code collision — loop and try another
  }
  throw new Error("Could not allocate an order code");
}

/** Moves a started order to pending with the buyer's details. */
export async function submitOrder(
  orderId: string,
  details: { buyerName: string; buyerEmail: string; trxId: string },
): Promise<OrderRow> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      buyer_name: details.buyerName,
      buyer_email: details.buyerEmail,
      submitted_trxid: details.trxId,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "started")
    .select("*")
    .single();
  if (error) throw error;
  return data as OrderRow;
}

/** For the buyer's status page. Token is the only credential. */
export async function getOrderByToken(token: string): Promise<OrderWithCase | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, ${CASE_JOIN}`)
    .eq("access_token", token)
    .maybeSingle();
  if (error) throw error;
  return (data as OrderWithCase | null) ?? null;
}

export async function getOrderByIdService(id: string): Promise<OrderWithCase | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, ${CASE_JOIN}`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as OrderWithCase | null) ?? null;
}

// ── Admin (cookie client — RLS: authenticated reads/updates) ────────────

export async function getPendingOrdersAdmin(): Promise<OrderWithCase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, ${CASE_JOIN}`)
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data as OrderWithCase[];
}

export async function getPendingCountAdmin(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

/** Everything that isn't started or pending, newest decision first. */
export async function getOrderHistoryAdmin(limit = 200): Promise<OrderWithCase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, ${CASE_JOIN}`)
    .in("status", ["paid", "rejected"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as OrderWithCase[];
}

export async function getOrderByIdAdmin(id: string): Promise<OrderWithCase | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, ${CASE_JOIN}`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as OrderWithCase | null) ?? null;
}

/**
 * Orders whose solution is due: paid, not sent, past the send time, and
 * still under the attempt cap. Service role — the cron has no session.
 */
export async function getDueSolutionOrders(limit = 25): Promise<OrderWithCase[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, ${CASE_JOIN}`)
    .eq("status", "paid")
    .eq("solution_sent", false)
    .lt("solution_attempts", MAX_SOLUTION_ATTEMPTS)
    .lte("solution_send_at", new Date().toISOString())
    .order("solution_send_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as OrderWithCase[];
}

/** After the cap the cron stops retrying and the admin has to step in. */
export const MAX_SOLUTION_ATTEMPTS = 5;

export async function markSolutionSent(orderId: string, attempts: number): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({
      solution_sent: true,
      solution_sent_at: new Date().toISOString(),
      solution_attempts: attempts + 1,
      solution_error: null,
    })
    .eq("id", orderId);
  if (error) throw error;
}

export async function markSolutionFailed(
  orderId: string,
  attempts: number,
  reason: string,
): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ solution_attempts: attempts + 1, solution_error: reason.slice(0, 300) })
    .eq("id", orderId);
  if (error) throw error;
}

/** The solution clock starts at approval — never at download. */
export function solutionSendAt(rank: Rank, approvedAt: Date): Date {
  return new Date(approvedAt.getTime() + RANKS[rank].solutionDelayHours * 3_600_000);
}
