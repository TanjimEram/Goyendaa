import Link from "next/link";
import { CaseForm } from "@/components/admin/CaseForm";

export default function NewCasePage() {
  return (
    <>
      <Link
        href="/admin"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash hover:text-brass"
      >
        &larr; All cases
      </Link>
      <h1 className="mt-4 mb-8 font-display text-3xl font-semibold text-cream">
        New case
      </h1>
      <CaseForm />
    </>
  );
}
