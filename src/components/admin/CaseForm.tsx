"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveCase, type CaseFormState } from "@/app/admin/(dashboard)/cases/actions";
import { FileUpload } from "@/components/admin/FileUpload";
import { RANKS, RANK_ORDER, type Rank } from "@/lib/cases";
import type { CaseRow } from "@/lib/cases-data";
import { slugify } from "@/lib/slug";
import { FILES_BUCKET, MEDIA_BUCKET } from "@/lib/storage";

const INPUT =
  "mt-2 w-full border border-noir-line bg-noir-raised px-3 py-2.5 font-sans text-sm text-cream outline-none transition-colors duration-300 ease-noir placeholder:text-ash/50 focus:border-brass";
const LABEL = "block font-mono text-[10px] uppercase tracking-[0.18em] text-ash";

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ash/80">{hint}</p>}
      {error && (
        <p className="mt-1.5 border-l-2 border-blood pl-2 font-mono text-[11px] text-cream">
          {error}
        </p>
      )}
    </div>
  );
}

/** Create when `initial` is undefined; edit otherwise. */
export function CaseForm({ initial }: { initial?: CaseRow }) {
  const [state, action, pending] = useActionState<CaseFormState, FormData>(
    saveCase,
    {},
  );
  const f = state.fields ?? {};

  // Slug follows the title until the admin edits it by hand.
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  // Upload state lives here and is serialised into hidden inputs on submit.
  const [thumbnail, setThumbnail] = useState<string[]>(
    initial?.thumbnail_url ? [initial.thumbnail_url] : [],
  );
  const [gallery, setGallery] = useState<string[]>(initial?.gallery_urls ?? []);
  const [casePdf, setCasePdf] = useState<string[]>(
    initial?.case_pdf_path ? [initial.case_pdf_path] : [],
  );
  const [solutionPdf, setSolutionPdf] = useState<string[]>(
    initial?.solution_pdf_path ? [initial.solution_pdf_path] : [],
  );

  function onTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  return (
    <form action={action} className="flex flex-col gap-10">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="thumbnail_url" value={thumbnail[0] ?? ""} />
      <input type="hidden" name="gallery_urls" value={JSON.stringify(gallery)} />
      <input type="hidden" name="case_pdf_path" value={casePdf[0] ?? ""} />
      <input type="hidden" name="solution_pdf_path" value={solutionPdf[0] ?? ""} />

      {/* ── Identity ─────────────────────────────────────────── */}
      <section className="grid gap-6 border border-noir-line bg-noir-raised/40 p-6 sm:grid-cols-2">
        <h2 className="font-display text-xl text-cream sm:col-span-2">The file</h2>

        <Field label="Title" name="title" error={f.title}>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field
          label="Slug"
          name="slug"
          error={f.slug}
          hint={`Public URL: /cases/${slug || "…"}`}
        >
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            onBlur={() => setSlug(slugify(slug))}
            className={`${INPUT} font-mono`}
          />
        </Field>

        <Field
          label="Premise — one line"
          name="premise"
          hint="Shown on the card. Hook the reader; give away nothing."
        >
          <textarea
            id="premise"
            name="premise"
            rows={2}
            defaultValue={initial?.premise ?? ""}
            className={INPUT}
          />
        </Field>

        <Field
          label="Description — the detail page hook"
          name="description"
          hint="Two or three sentences. Tease the contradiction, never the mechanism."
        >
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={initial?.description ?? ""}
            className={INPUT}
          />
        </Field>

        <Field
          label="Tags"
          name="tags"
          hint="Comma-separated, up to 8. e.g. Locked room, Two suspects"
        >
          <input
            id="tags"
            name="tags"
            defaultValue={(initial?.tags ?? []).join(", ")}
            className={INPUT}
          />
        </Field>
      </section>

      {/* ── Difficulty & pricing ─────────────────────────────── */}
      <section className="grid gap-6 border border-noir-line bg-noir-raised/40 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="font-display text-xl text-cream sm:col-span-2 lg:col-span-4">
          Rank, price, size
        </h2>

        <Field label="Difficulty rank" name="difficulty_rank" error={f.difficulty_rank}>
          <select
            id="difficulty_rank"
            name="difficulty_rank"
            defaultValue={initial?.difficulty_rank ?? "rookie"}
            className={INPUT}
          >
            {RANK_ORDER.map((r: Rank) => (
              <option key={r} value={r}>
                {RANKS[r].label} — solution +{RANKS[r].solutionDelayHours}h
              </option>
            ))}
          </select>
        </Field>

        <Field label="Price (৳)" name="price" error={f.price}>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={initial?.price ?? 250}
            className={`${INPUT} font-mono`}
          />
        </Field>

        <Field label="Solve time (minutes)" name="solve_minutes" error={f.solve_minutes}>
          <input
            id="solve_minutes"
            name="solve_minutes"
            type="number"
            min={1}
            step={5}
            required
            defaultValue={initial?.solve_minutes ?? 60}
            className={`${INPUT} font-mono`}
          />
        </Field>

        <Field label="Printed pages" name="page_count" error={f.page_count}>
          <input
            id="page_count"
            name="page_count"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={initial?.page_count ?? 0}
            className={`${INPUT} font-mono`}
          />
        </Field>
      </section>

      {/* ── Media ────────────────────────────────────────────── */}
      <section className="grid gap-8 border border-noir-line bg-noir-raised/40 p-6">
        <h2 className="font-display text-xl text-cream">Images</h2>

        <FileUpload
          label="Thumbnail"
          hint="Card image, roughly 16:9. JPG/PNG/WebP, under 5 MB."
          bucket={MEDIA_BUCKET}
          folder="thumbnails"
          accept="image/jpeg,image/png,image/webp,image/avif"
          isPublic
          preview="image"
          value={thumbnail}
          onChange={setThumbnail}
        />

        <FileUpload
          label="Gallery / preview pages"
          hint="Redacted page images for the detail page. First three are shown, in this order."
          bucket={MEDIA_BUCKET}
          folder="gallery"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          isPublic
          preview="image"
          value={gallery}
          onChange={setGallery}
        />
      </section>

      {/* ── PDFs ─────────────────────────────────────────────── */}
      <section className="grid gap-8 border border-noir-line bg-noir-raised/40 p-6 sm:grid-cols-2">
        <h2 className="font-display text-xl text-cream sm:col-span-2">
          PDFs <span className="ml-2 font-mono text-[10px] tracking-[0.16em] text-ash">PRIVATE BUCKET</span>
        </h2>

        <FileUpload
          label="Case file PDF"
          hint="The evidence pack buyers download."
          bucket={FILES_BUCKET}
          folder="cases"
          accept="application/pdf"
          isPublic={false}
          value={casePdf}
          onChange={setCasePdf}
        />

        <FileUpload
          label="Solution PDF"
          hint="Emailed after the rank's delay. Never linked publicly."
          bucket={FILES_BUCKET}
          folder="solutions"
          accept="application/pdf"
          isPublic={false}
          value={solutionPdf}
          onChange={setSolutionPdf}
        />
      </section>

      {/* ── Visibility ───────────────────────────────────────── */}
      <section className="flex flex-wrap gap-8 border border-noir-line bg-noir-raised/40 p-6">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={initial?.published ?? false}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-cream">
              Published
            </span>
            <span className="block text-xs text-ash">Visible in the public catalogue.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured ?? false}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-cream">
              Featured
            </span>
            <span className="block text-xs text-ash">On the homepage teaser row (first three).</span>
          </span>
        </label>
      </section>

      {state.error && (
        <p role="alert" className="border-l-2 border-blood pl-3 font-mono text-[11px] text-cream">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-blood px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors hover:bg-blood-hot disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create case"}
        </button>
        <Link
          href="/admin"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-ash hover:text-cream"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
