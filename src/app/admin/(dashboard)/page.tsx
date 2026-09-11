import Image from "next/image";
import Link from "next/link";
import { DeleteCaseButton } from "@/components/admin/DeleteCaseButton";
import { RANKS, formatTaka } from "@/lib/cases";
import { getAllCasesAdmin } from "@/lib/cases-data";

export default async function AdminCasesPage() {
  const cases = await getAllCasesAdmin();
  const published = cases.filter((c) => c.published).length;

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
            {published} published &middot; ordered by position
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
        <div className="mt-8 overflow-x-auto border border-noir-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-noir-raised font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
              <tr>
                <th className="px-4 py-3 font-normal">Pos</th>
                <th className="px-4 py-3 font-normal">Case</th>
                <th className="px-4 py-3 font-normal">Rank</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">PDFs</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-line">
              {cases.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-[11px] text-ash">
                    {c.position}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden border border-noir-line bg-noir">
                        {c.thumbnail_url ? (
                          <Image
                            src={c.thumbnail_url}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center font-mono text-[9px] text-ash">
                            none
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-cream">
                          {c.title}
                        </p>
                        <p className="truncate font-mono text-[10px] text-ash">
                          CASE {String(c.case_number).padStart(3, "0")} &middot;{" "}
                          /{c.slug}
                          {c.featured && (
                            <span className="ml-2 text-brass">featured</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-brass">
                    {RANKS[c.difficulty_rank]?.label ?? c.difficulty_rank}
                  </td>
                  <td className="px-4 py-3 font-mono text-cream">
                    {formatTaka(c.price)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em]">
                    <span
                      className={c.case_pdf_path ? "text-cream" : "text-ash/50"}
                      title={c.case_pdf_path ?? "No case PDF uploaded"}
                    >
                      case
                    </span>
                    <span className="text-ash"> / </span>
                    <span
                      className={
                        c.solution_pdf_path ? "text-cream" : "text-ash/50"
                      }
                      title={c.solution_pdf_path ?? "No solution PDF uploaded"}
                    >
                      solution
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.published ? (
                      <span className="border border-brass/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
                        Published
                      </span>
                    ) : (
                      <span className="border border-noir-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/cases/${c.id}/edit`}
                        className="border border-noir-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream transition-colors hover:border-brass"
                      >
                        Edit
                      </Link>
                      <DeleteCaseButton id={c.id} title={c.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
