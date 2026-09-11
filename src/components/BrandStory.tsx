/** Stamped case-file document, built from divs — no image asset needed. */
function StampedDocument() {
  return (
    <div
      aria-hidden
      className="relative rotate-[-1.5deg] border border-noir-line bg-noir-raised p-6 shadow-stamp sm:p-8"
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-brass">
        GOYENDA / CASE ABSTRACT
      </p>
      <div className="mt-4 h-px w-full bg-noir-line" />

      <div className="mt-5 flex flex-col gap-[7px]">
        <div className="h-2 w-2/5 bg-cream/25" />
        <div className="mt-2 h-1.5 w-full bg-cream/15" />
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1/3 bg-cream/15" />
          <div className="redacted h-3 w-24" />
        </div>
        <div className="h-1.5 w-11/12 bg-cream/15" />
        <div className="h-1.5 w-3/4 bg-cream/15" />
        <div className="flex items-center gap-2">
          <div className="redacted h-3 w-16" />
          <div className="h-1.5 w-2/5 bg-cream/15" />
        </div>
        <div className="h-1.5 w-5/6 bg-cream/15" />
        <div className="h-1.5 w-1/2 bg-cream/15" />
      </div>

      {/* The stamp */}
      <span className="absolute right-5 -bottom-4 rotate-[-7deg] border-[3px] border-blood px-4 py-1.5 font-mono text-lg font-semibold tracking-[0.14em] text-blood sm:right-8 sm:text-xl">
        FICTIONAL
      </span>
    </div>
  );
}

export function BrandStory() {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
            Why Goyenda
          </p>

          <h2 className="mt-4 font-display text-4xl leading-[1.1] font-semibold text-cream sm:text-5xl">
            Goyenda means detective.
          </h2>

          <div className="mt-7 flex flex-col gap-5 text-base leading-[1.8] text-ash">
            <p>
              Most mystery games hand you a script and a set of dice. We wanted
              the opposite &mdash; the unglamorous, paper-heavy version of the
              job. So we build the file the way an investigator would receive
              it: statements that contradict each other, a forensic note nobody
              read properly, a timeline with a hole in it.
            </p>
            <p>
              Every case is invented. We study the{" "}
              <span className="text-cream">patterns</span> of real
              investigations &mdash; how alibis break, how a scene gets staged,
              what people do with their hands when they lie &mdash; and build
              fiction on top of them. We do not retell real crimes. No real
              victim&rsquo;s name appears anywhere in a Goyenda file, and none
              ever will.
            </p>
            <p>
              And we hold the solution back. It reaches your inbox hours after
              you buy, because a mystery you can spoil in ten seconds
              isn&rsquo;t worth solving.
            </p>
          </div>

          <p className="mt-8 border-l-2 border-blood pl-5 font-display text-xl leading-[1.5] text-cream italic sm:text-2xl">
            &ldquo;You&rsquo;re not here to read a story. You&rsquo;re here to
            close a case.&rdquo;
          </p>
        </div>

        <StampedDocument />
      </div>
    </section>
  );
}
