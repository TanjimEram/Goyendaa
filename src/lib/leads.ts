import "server-only";

import type { CaseRow } from "@/lib/cases-data";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Utm } from "@/lib/utm";

/**
 * Free cases and the leads they collect (migration 0012). The lead's token
 * is the credential for the free download and the answer page: it rides in
 * the email links (?t=) and in an httpOnly cookie per case (leadCookie).
 * Leads are service-role only, like orders; the admin reads them via RLS.
 */

export interface LeadRow extends Utm {
  id: string;
  email: string;
  name: string | null;
  case_id: string | null;
  case_slug: string;
  consent: boolean;
  token: string;
  downloads: number;
  answer_views: number;
  created_at: string;
  updated_at: string;
}

export type FreeCase = Pick<
  CaseRow,
  "id" | "slug" | "title" | "premise" | "price" | "case_pdf_path" | "answer_md" | "answer_image_path" | "answer_unlock_at" | "answer_delay_minutes" | "thumbnail_url"
>;

/** httpOnly cookie that remembers a lead's token for one case. */
export const leadCookie = (slug: string) => `gyd_lead_${slug}`;

const TOKEN = /^[0-9a-f-]{36}$/i;

/** A published free case, with the server-only answer fields. */
export async function getFreeCase(slug: string): Promise<FreeCase | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("cases")
    .select("id, slug, title, premise, price, case_pdf_path, answer_md, answer_image_path, answer_unlock_at, answer_delay_minutes, thumbnail_url")
    .eq("slug", slug)
    .eq("published", true)
    .eq("is_free", true)
    .maybeSingle();
  if (error) throw error;
  return (data as FreeCase | null) ?? null;
}

/** Same email + same case updates the lead (first UTM touch kept). */
export async function upsertLead(input: {
  email: string;
  name: string | null;
  caseId: string;
  caseSlug: string;
  consent: boolean;
  utm: Utm;
}): Promise<{ token: string; created: boolean }> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("upsert_lead", {
    p_email: input.email,
    p_name: input.name,
    p_case_id: input.caseId,
    p_case_slug: input.caseSlug,
    p_consent: input.consent,
    p_utm_source: input.utm.utm_source,
    p_utm_medium: input.utm.utm_medium,
    p_utm_campaign: input.utm.utm_campaign,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { token: string; created: boolean };
  return row;
}

/** The lead behind a token, but only for this case. */
export async function leadForCase(token: string | undefined, slug: string): Promise<LeadRow | null> {
  if (!token || !TOKEN.test(token)) return null;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("token", token)
    .eq("case_slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as LeadRow | null) ?? null;
}

/** Bumps the download or answer-view counter. Best-effort. */
export async function leadHit(token: string, kind: "download" | "answer"): Promise<void> {
  try {
    const supabase = await createServiceClient();
    await supabase.rpc("lead_hit", { p_token: token, p_kind: kind });
  } catch {
    // A missed count is not worth failing a download over.
  }
}

/** Unsubscribe: consent = no on every lead with this token's email. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!TOKEN.test(token)) return false;
  const supabase = await createServiceClient();
  const { data: lead } = await supabase.from("leads").select("email").eq("token", token).maybeSingle();
  if (!lead) return false;
  const { error } = await supabase
    .from("leads")
    .update({ consent: false, updated_at: new Date().toISOString() })
    .eq("email", (lead as { email: string }).email);
  if (error) throw error;
  return true;
}

// ── Admin (cookie client: RLS lets the signed-in admin read) ───────────

export async function listLeadsAdmin(filter: { caseSlug?: string; consent?: boolean }): Promise<LeadRow[]> {
  const supabase = await createClient();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5000);
  if (filter.caseSlug) q = q.eq("case_slug", filter.caseSlug);
  if (filter.consent !== undefined) q = q.eq("consent", filter.consent);
  const { data, error } = await q;
  if (error) throw error;
  return data as LeadRow[];
}

export interface FreeCaseStats {
  slug: string;
  leads: number;
  downloads: number;
  answerViews: number;
  /** Leads whose email later appears on a paid order. */
  buyers: number;
}

/** Per free case: leads, downloads, answer views, and leads who later paid. */
export async function freeCaseStatsAdmin(leads: LeadRow[]): Promise<FreeCaseStats[]> {
  const supabase = await createClient();
  const { data: paid, error } = await supabase
    .from("orders")
    .select("buyer_email, approved_at")
    .eq("status", "paid");
  if (error) throw error;
  // Earliest paid order per email.
  const firstPaid = new Map<string, number>();
  for (const o of (paid ?? []) as { buyer_email: string | null; approved_at: string | null }[]) {
    const e = (o.buyer_email ?? "").toLowerCase();
    const t = o.approved_at ? Date.parse(o.approved_at) : NaN;
    if (e && !Number.isNaN(t) && (!firstPaid.has(e) || t < firstPaid.get(e)!)) firstPaid.set(e, t);
  }
  const by = new Map<string, FreeCaseStats>();
  for (const l of leads) {
    const s = by.get(l.case_slug) ?? { slug: l.case_slug, leads: 0, downloads: 0, answerViews: 0, buyers: 0 };
    s.leads++;
    s.downloads += l.downloads;
    s.answerViews += l.answer_views;
    const paidAt = firstPaid.get(l.email.toLowerCase());
    if (paidAt !== undefined && paidAt >= Date.parse(l.created_at)) s.buyers++;
    by.set(l.case_slug, s);
  }
  return [...by.values()];
}

/** Paid orders grouped by UTM source: which channel actually sells. */
export async function salesBySourceAdmin(): Promise<{ source: string; orders: number; revenue: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("utm_source, amount").eq("status", "paid");
  if (error) return []; // migration 0012 not run yet: no UTM columns
  const by = new Map<string, { source: string; orders: number; revenue: number }>();
  for (const o of (data ?? []) as { utm_source: string | null; amount: number }[]) {
    const source = o.utm_source ?? "(direct / unknown)";
    const s = by.get(source) ?? { source, orders: 0, revenue: 0 };
    s.orders++;
    s.revenue += o.amount;
    by.set(source, s);
  }
  return [...by.values()].sort((a, b) => b.revenue - a.revenue);
}

/**
 * When this visitor's answer opens, or null if it's open now. Two holds,
 * the later wins: a fixed date (answer_unlock_at, e.g. 48 h after a post)
 * and a per-visitor delay counted from when they got the case.
 */
export function answerOpensAt(
  freeCase: Pick<FreeCase, "answer_unlock_at" | "answer_delay_minutes">,
  gotCaseAt: string | Date,
): string | null {
  const fixed = freeCase.answer_unlock_at ? Date.parse(freeCase.answer_unlock_at) : 0;
  const delay = freeCase.answer_delay_minutes
    ? new Date(gotCaseAt).getTime() + freeCase.answer_delay_minutes * 60_000
    : 0;
  const opens = Math.max(fixed, delay);
  return opens > Date.now() ? new Date(opens).toISOString() : null;
}

/** One CSV cell: quoted, inner quotes doubled, and a leading = + - @
 *  neutralised so a spreadsheet never runs a lead's input as a formula. */
function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** The Leads table as CSV (UTF-8 with BOM so Excel reads Bangla names). */
export function leadsToCsv(leads: LeadRow[]): string {
  const head = ["email", "name", "case", "consent", "utm_source", "utm_medium", "utm_campaign", "downloads", "answer_views", "created_at"];
  const rows = leads.map((l) =>
    [l.email, l.name, l.case_slug, l.consent ? "yes" : "no", l.utm_source, l.utm_medium, l.utm_campaign, l.downloads, l.answer_views, l.created_at]
      .map(csvCell)
      .join(","),
  );
  return "﻿" + [head.join(","), ...rows].join("\r\n") + "\r\n";
}
