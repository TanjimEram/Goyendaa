import Link from "next/link";
import { CaseTable, type CaseListItem } from "@/components/admin/CaseTable";
import { getAllCasesAdmin } from "@/lib/cases-data";

export default async function AdminCasesPage() {
  const cases = await getAllCasesAdmin();
  const published = cases.filter((c) => c.published).length;

  // Only the columns the table renders cross the server→client boundary.
  const items: CaseListItem[] = cases.map((c) => ({
    id: c.id,
    case_number: c.case_number,
    slug: c.slug,
    title: c.title,
    price: c.price,
    difficulty_rank: c.difficulty_rank,
    published: c.published,
    featured: c.featured,
    thumbnail_url: c.thumbnail_url,
    case_pdf_path: c.case_pdf_path,
    solution_pdf_path: c.solution_pdf_path,
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
            Cases
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-cream">
            {cases.length} file{cases.length === 1 ? "" : "s"} on record
          </h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            {published} published &middot; shown in catalogue order
          </p>
        </div>
        <Link
          href="/admin/cases/new"
          className="bg-blood px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors hover:bg-blood-hot"
        >
          + New case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="mt-10 border border-noir-line bg-noir-raised px-6 py-16 text-center">
          <p className="font-display text-2xl text-cream">No cases yet.</p>
          <p className="mt-2 text-sm text-ash">
            Create one, or run{" "}
            <code className="font-mono text-cream">supabase/seed.sql</code> for
            the eight placeholders.
          </p>
        </div>
      ) : (
        <CaseTable key={items.map((i) => i.id).join(",")} initial={items} />
      )}
    </>
  );
}
