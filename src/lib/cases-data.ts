import "server-only";

import { createClient, createPublicClient } from "@/lib/supabase/server";
import { isRank, type CaseFile, type ContentItem, type Rank } from "@/lib/cases";

/** One row of `public.cases`, as Supabase returns it. */
export interface CaseRow {
  id: string;
  case_number: number;
  slug: string;
  title: string;
  premise: string;
  description: string;
  price: number;
  difficulty_rank: Rank;
  position: number;
  published: boolean;
  featured: boolean;
  thumbnail_url: string | null;
  gallery_urls: string[];
  case_pdf_path: string | null;
  solution_pdf_path: string | null;
  purchase_info: string | null;
  delivery_info: string | null;
  contents: ContentItem[];
  player_note: string | null;
  content_note: string | null;
  tags: string[];
  solve_minutes: number;
  page_count: number;
  created_at: string;
  updated_at: string;
}

/** The columns the public site needs. Listed explicitly so the PDF paths
 *  never travel to the public pages by accident. */
const PUBLIC_COLUMNS =
  "id, case_number, slug, title, premise, description, price, difficulty_rank, position, published, featured, thumbnail_url, gallery_urls, tags, solve_minutes, page_count, purchase_info, delivery_info, contents, player_note, content_note";

/** DB row → the shape every component already renders. */
export function rowToCaseFile(row: CaseRow): CaseFile {
  return {
    id: row.id,
    slug: row.slug,
    code: `CASE ${String(row.case_number).padStart(3, "0")}`,
    title: row.title,
    premise: row.premise,
    hook: row.description,
    rank: isRank(row.difficulty_rank) ? row.difficulty_rank : "rookie",
    solveMinutes: row.solve_minutes,
    pages: row.page_count,
    priceBdt: row.price,
    tags: row.tags ?? [],
    exhibit: "Case brief",
    thumbnail: row.thumbnail_url ?? undefined,
    gallery: row.gallery_urls ?? [],
    featured: row.featured,
    contents: Array.isArray(row.contents) ? row.contents : [],
    purchaseInfo: row.purchase_info ?? undefined,
    deliveryInfo: row.delivery_info ?? undefined,
    playerNote: row.player_note ?? undefined,
    contentNote: row.content_note ?? undefined,
  };
}

/**
 * Public reads swallow errors in production and return empty — a shop page
 * with no files beats a 500. In development they throw so misconfiguration
 * is impossible to miss.
 */
function publicFailure<T>(what: string, error: unknown, fallback: T): T {
  if (process.env.NODE_ENV !== "production") throw error;
  console.error(`[cases-data] ${what} failed`, error);
  return fallback;
}

// ── Public site ─────────────────────────────────────────────────────────

/** Every published case, in catalogue order. */
export async function getPublishedCases(): Promise<CaseFile[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cases")
    .select(PUBLIC_COLUMNS)
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return publicFailure("getPublishedCases", error, []);
  return (data as CaseRow[]).map(rowToCaseFile);
}

/** One published case by slug, or null (unpublished counts as missing). */
export async function getPublishedCase(slug: string): Promise<CaseFile | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cases")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) return publicFailure("getPublishedCase", error, null);
  return data ? rowToCaseFile(data as CaseRow) : null;
}

// ── Admin ───────────────────────────────────────────────────────────────
// These use the cookie-aware client, so RLS grants full access only when the
// admin is signed in. Errors propagate: the admin should see them.

/** Every case, published or not, in catalogue order. */
export async function getAllCasesAdmin(): Promise<CaseRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as CaseRow[];
}

export async function getCaseByIdAdmin(id: string): Promise<CaseRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as CaseRow | null) ?? null;
}
