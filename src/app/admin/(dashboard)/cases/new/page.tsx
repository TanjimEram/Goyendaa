import Link from "next/link";
import { CaseForm } from "@/components/admin/CaseForm";
import { RANKS, isRank } from "@/lib/cases";

/** `?rank=senior` (from a section's "+ New" link) preselects the category. */
export default async function NewCasePage({ searchParams }: PageProps<"/admin/cases/new">) {
  const { rank } = await searchParams;
  const defaultRank = isRank(rank) ? rank : undefined;
  return (
    <>
      <Link
        href="/admin"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash hover:text-brass"
      >
        &larr; All cases
      </Link>
      <h1 className="mt-4 mb-8 font-display text-3xl font-semibold text-cream">
        New {defaultRank ? `${RANKS[defaultRank].label} ` : ""}case
      </h1>
      <CaseForm defaultRank={defaultRank} />
    </>
  );
}
