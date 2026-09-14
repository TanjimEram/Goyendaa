import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Frame for prose pages (terms, privacy, refunds, contact, FAQ). Keeps them
 * narrow and readable; sections use `<Section>` so headings and rhythm match.
 */
export function TextPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** "Last updated" line for legal pages. */
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="border-b border-noir-line">
          <div className="mx-auto w-full max-w-3xl px-5 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
              <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-cream sm:text-5xl">
              {title}
            </h1>
            {intro && (
              <div className="mt-6 max-w-xl text-base leading-[1.7] text-ash sm:text-lg">
                {intro}
              </div>
            )}
            {updated && (
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                Last updated {updated}
              </p>
            )}
          </div>
        </section>
        <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** A numbered or titled block of prose within a TextPage. */
export function Section({
  id,
  n,
  title,
  children,
}: {
  id?: string;
  n?: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-noir-line py-8 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-4 font-display text-2xl font-semibold text-cream">
        {n !== undefined && (
          <span className="font-mono text-xs tracking-[0.2em] text-brass">
            {String(n).padStart(2, "0")}
          </span>
        )}
        {title}
      </h2>
      <div className="prose-noir mt-4 flex flex-col gap-4 text-[15px] leading-[1.8] text-ash">
        {children}
      </div>
    </section>
  );
}
