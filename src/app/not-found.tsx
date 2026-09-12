import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="vignette relative flex flex-1 items-center">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
            404
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.6rem] leading-[1.02] font-semibold text-cream sm:text-6xl">
            This trail&rsquo;s gone cold.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-[1.7] text-ash">
            Whatever was here has been moved, closed, or never existed. The
            open files are all in the Casebook.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/cases"
              className="inline-flex items-center gap-3 bg-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp"
            >
              Open the Casebook <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center border border-noir-line px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors duration-300 ease-noir hover:border-brass hover:text-brass"
            >
              Home
            </Link>
          </div>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 bottom-16 rotate-[-7deg] border-[3px] border-blood px-4 py-1.5 font-mono text-lg font-semibold tracking-[0.14em] text-blood sm:right-16 sm:text-2xl"
        >
          COLD CASE
        </span>
      </main>
      <SiteFooter />
    </>
  );
}
