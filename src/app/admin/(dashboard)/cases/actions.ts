"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  RANKS,
  isRank,
  limitMessage,
  parseContentsText,
  withinLimit,
  type ContentItem,
} from "@/lib/cases";
import { getCaseByIdAdmin } from "@/lib/cases-data";
import { SLUG_PATTERN, slugify } from "@/lib/slug";
import { MEDIA_BUCKET, FILES_BUCKET, publicUrlToPath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export interface CaseFormState {
  error?: string;
  /** Field-level messages, keyed by input name. */
  fields?: Record<string, string>;
  /**
   * What the admin submitted, echoed back on failure. React 19 resets a
   * form after its action runs, so uncontrolled inputs would otherwise
   * snap back to their original values and the typing would be lost.
   */
  values?: Record<string, string>;
}

/** Text fields echoed back after a failed save. Uploads live in client state. */
const ECHOED_FIELDS = [
  "premise",
  "description",
  "tags",
  "price",
  "solve_minutes",
  "page_count",
  "contents_text",
  "purchase_info",
  "delivery_info",
  "player_note",
  "content_note",
  "published",
  "featured",
] as const;

function echo(fd: FormData): Record<string, string> {
  return Object.fromEntries(ECHOED_FIELDS.map((k) => [k, String(fd.get(k) ?? "")]));
}

/** Shape of the row we write. Mirrors `public.cases` minus generated cols. */
interface CaseWrite {
  slug: string;
  title: string;
  premise: string;
  description: string;
  price: number;
  difficulty_rank: string;
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
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");
  return supabase;
}

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
function int(fd: FormData, key: string) {
  // Number() rather than parseInt: "240abc" and "2.5" must fail, not truncate.
  const raw = str(fd, key);
  return raw === "" ? NaN : Number(raw);
}
function list(fd: FormData, key: string): string[] {
  // Multi-value inputs arrive as JSON from the client form.
  try {
    const parsed = JSON.parse(str(fd, key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Validates the form and returns either a row to write or field errors. */
function parseCaseForm(fd: FormData):
  | { ok: true; row: CaseWrite }
  | { ok: false; fields: Record<string, string> } {
  const fields: Record<string, string> = {};

  const title = str(fd, "title");
  if (!title) fields.title = "Title is required.";
  if (title.length > 120) fields.title = "Keep the title under 120 characters.";

  let slug = str(fd, "slug") || slugify(title);
  slug = slugify(slug);
  if (!SLUG_PATTERN.test(slug)) fields.slug = "Lowercase letters, numbers and hyphens only.";

  const price = int(fd, "price");
  if (!withinLimit("price", price)) fields.price = limitMessage("price");

  const difficulty_rank = str(fd, "difficulty_rank");
  if (!isRank(difficulty_rank)) fields.difficulty_rank = "Pick a rank.";

  const solve_minutes = int(fd, "solve_minutes");
  if (!withinLimit("solve_minutes", solve_minutes)) {
    fields.solve_minutes = limitMessage("solve_minutes");
  }

  const page_count = int(fd, "page_count");
  if (!withinLimit("page_count", page_count)) fields.page_count = limitMessage("page_count");

  const tags = str(fd, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (Object.keys(fields).length) return { ok: false, fields };

  return {
    ok: true,
    row: {
      slug,
      title,
      premise: str(fd, "premise"),
      description: str(fd, "description"),
      price,
      difficulty_rank,
      published: fd.get("published") === "on",
      featured: fd.get("featured") === "on",
      thumbnail_url: str(fd, "thumbnail_url") || null,
      gallery_urls: list(fd, "gallery_urls"),
      case_pdf_path: str(fd, "case_pdf_path") || null,
      solution_pdf_path: str(fd, "solution_pdf_path") || null,
      purchase_info: str(fd, "purchase_info") || null,
      delivery_info: str(fd, "delivery_info") || null,
      contents: parseContentsText(str(fd, "contents_text")),
      player_note: str(fd, "player_note") || null,
      content_note: str(fd, "content_note") || null,
      tags,
      solve_minutes,
      page_count,
    },
  };
}

function revalidateCasePages(...slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/cases");
  revalidatePath("/admin");
  for (const s of slugs) if (s) revalidatePath(`/cases/${s}`);
}

/** Create (no `id`) or update (with `id`). Used with useActionState. */
export async function saveCase(
  _prev: CaseFormState,
  formData: FormData,
): Promise<CaseFormState> {
  const supabase = await requireAdmin();
  const id = str(formData, "id") || null;

  const values = echo(formData);
  const parsed = parseCaseForm(formData);
  if (!parsed.ok) {
    const n = Object.keys(parsed.fields).length;
    return {
      fields: parsed.fields,
      values,
      error: `Fix ${n} field${n === 1 ? "" : "s"} before saving.`,
    };
  }
  const { row } = parsed;

  // A rank change is fine; a rank we don't know about is not.
  if (!RANKS[row.difficulty_rank as keyof typeof RANKS]) {
    return { error: "Unknown difficulty rank.", values };
  }

  let previousSlug: string | null = null;

  if (id) {
    const existing = await getCaseByIdAdmin(id);
    if (!existing) return { error: "That case no longer exists.", values };
    previousSlug = existing.slug;

    const { error } = await supabase.from("cases").update(row).eq("id", id);
    if (error) return { ...dbErrorState(error.message), values };
  } else {
    // New cases go to the end of the catalogue.
    const { data: last } = await supabase
      .from("cases")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (last?.position ?? 0) + 1;

    const { error } = await supabase.from("cases").insert({ ...row, position });
    if (error) return { ...dbErrorState(error.message), values };
  }

  revalidateCasePages(row.slug, previousSlug);
  redirect("/admin");
}

/** Deletes the row and its storage objects. Called from a confirmed form. */
export async function deleteCase(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;

  const existing = await getCaseByIdAdmin(id);
  if (!existing) return;

  // Best-effort storage cleanup. Failures here shouldn't block the delete;
  // an orphaned file is cheaper than a case that can't be removed.
  const mediaPaths = [existing.thumbnail_url, ...existing.gallery_urls]
    .map((u) => (u ? publicUrlToPath(u, MEDIA_BUCKET) : null))
    .filter((p): p is string => Boolean(p));
  const filePaths = [existing.case_pdf_path, existing.solution_pdf_path].filter(
    (p): p is string => Boolean(p),
  );
  if (mediaPaths.length) await supabase.storage.from(MEDIA_BUCKET).remove(mediaPaths);
  if (filePaths.length) await supabase.storage.from(FILES_BUCKET).remove(filePaths);

  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error.message));

  revalidateCasePages(existing.slug);
}

/**
 * Persists a new catalogue order. `ids` is every case id in the desired
 * order; positions become 1..n. One RPC, one transaction.
 */
export async function reorderCases(ids: string[]): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const clean = ids.filter((id) => typeof id === "string" && id.length > 0);
  if (!clean.length) return { error: "Nothing to reorder." };

  const { error } = await supabase.rpc("reorder_cases", { ids: clean });
  if (error) {
    if (error.message.includes("reorder_cases")) {
      return { error: "Run supabase/migrations/0003_reorder.sql first." };
    }
    return { error: friendlyDbError(error.message) };
  }

  revalidateCasePages();
  return {};
}

/** Translate the few Postgres errors an admin can actually cause. */
function friendlyDbError(message: string): string {
  if (message.includes("cases_slug_key")) return "That slug is already taken.";
  if (message.includes("cases_slug_check")) return "Slug can only contain lowercase letters, numbers and hyphens.";
  if (message.includes("row-level security")) return "Not allowed — are you still signed in?";
  return message;
}

/**
 * A DB error as form state: pinned to the field it's about when we can
 * tell (unique slug, a range CHECK), otherwise a form-level message.
 */
function dbErrorState(message: string): CaseFormState {
  if (message.includes("cases_slug_key")) {
    return { error: "Fix 1 field before saving.", fields: { slug: "That slug is already taken." } };
  }
  if (message.includes("cases_slug_check")) {
    return { error: "Fix 1 field before saving.", fields: { slug: friendlyDbError(message) } };
  }
  for (const field of ["price", "solve_minutes", "page_count"] as const) {
    if (message.includes(`cases_${field}_range`)) {
      return { error: "Fix 1 field before saving.", fields: { [field]: limitMessage(field) } };
    }
  }
  return { error: friendlyDbError(message) };
}
