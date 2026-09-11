"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RANKS, isRank } from "@/lib/cases";
import { getCaseByIdAdmin } from "@/lib/cases-data";
import { SLUG_PATTERN, slugify } from "@/lib/slug";
import { MEDIA_BUCKET, FILES_BUCKET, publicUrlToPath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export interface CaseFormState {
  error?: string;
  /** Field-level messages, keyed by input name. */
  fields?: Record<string, string>;
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
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : NaN;
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
  if (!(price >= 0)) fields.price = "Price must be 0 or more.";

  const difficulty_rank = str(fd, "difficulty_rank");
  if (!isRank(difficulty_rank)) fields.difficulty_rank = "Pick a rank.";

  const solve_minutes = int(fd, "solve_minutes");
  if (!(solve_minutes > 0)) fields.solve_minutes = "Must be at least 1 minute.";

  const page_count = int(fd, "page_count");
  if (!(page_count >= 0)) fields.page_count = "Must be 0 or more.";

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

  const parsed = parseCaseForm(formData);
  if (!parsed.ok) return { fields: parsed.fields, error: "Fix the fields marked below." };
  const { row } = parsed;

  // A rank change is fine; a rank we don't know about is not.
  if (!RANKS[row.difficulty_rank as keyof typeof RANKS]) {
    return { error: "Unknown difficulty rank." };
  }

  let previousSlug: string | null = null;

  if (id) {
    const existing = await getCaseByIdAdmin(id);
    if (!existing) return { error: "That case no longer exists." };
    previousSlug = existing.slug;

    const { error } = await supabase.from("cases").update(row).eq("id", id);
    if (error) return { error: friendlyDbError(error.message) };
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
    if (error) return { error: friendlyDbError(error.message) };
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

/** Translate the few Postgres errors an admin can actually cause. */
function friendlyDbError(message: string): string {
  if (message.includes("cases_slug_key")) return "That slug is already taken.";
  if (message.includes("cases_slug_check")) return "Slug can only contain lowercase letters, numbers and hyphens.";
  if (message.includes("row-level security")) return "Not allowed — are you still signed in?";
  return message;
}
