import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseForm } from "@/components/admin/CaseForm";
import { getCaseByIdAdmin } from "@/lib/cases-data";
import { FILES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

/** Short-lived links so the admin can check what's actually uploaded. */
async function signedLinks(paths: (string | null)[]) {
  const supabase = await createClient();
  const out: Record<string, string> = {};
  for (const p of paths) {
    if (!p) continue;
    const { data } = await supabase.storage.from(FILES_BUCKET).createSignedUrl(p, 300);
    if (data?.signedUrl) out[p] = data.signedUrl;
  }
  return out;
}

export default async function EditCasePage({ params }: PageProps<"/admin/cases/[id]/edit">) {
  const { id } = await params;
  const caseRow = await getCaseByIdAdmin(id);
  if (!caseRow) notFound();

  const links = await signedLinks([caseRow.case_pdf_path, caseRow.solution_pdf_path]);

  return (
    <>
      <Link
        href="/admin"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash hover:text-brass"
      >
        &larr; All cases
      </Link>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
            CASE {String(caseRow.case_number).padStart(3, "0")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-cream">
            {caseRow.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
          {caseRow.published && (
            <Link
              href={`/cases/${caseRow.slug}`}
              target="_blank"
              className="text-ash hover:text-cream"
            >
              View live &nearr;
            </Link>
          )}
          {caseRow.case_pdf_path && links[caseRow.case_pdf_path] && (
            <a href={links[caseRow.case_pdf_path]} target="_blank" rel="noreferrer" className="text-ash hover:text-cream">
              Open case PDF &nearr;
            </a>
          )}
          {caseRow.solution_pdf_path && links[caseRow.solution_pdf_path] && (
            <a href={links[caseRow.solution_pdf_path]} target="_blank" rel="noreferrer" className="text-ash hover:text-cream">
              Open solution PDF &nearr;
            </a>
          )}
        </div>
      </div>
      <CaseForm initial={caseRow} />
    </>
  );
}
