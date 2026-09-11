const STEPS = [
  {
    n: "01",
    title: "Choose a file",
    body: "Pick a case by difficulty rank. Pay with bKash, Nagad or card — no account, no subscription.",
  },
  {
    n: "02",
    title: "Print and investigate",
    body: "Download the evidence pack straight away. Print it, lay it out, and work the case alone or with friends.",
  },
  {
    n: "03",
    title: "The solution finds you",
    body: "The answer arrives by email hours later — one hour for a Rookie file, three for a Master. No shortcuts.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-noir-line bg-noir-raised/40"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
          <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
          How it works
        </p>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-brass-dim pt-6">
              <span className="font-mono text-xs tracking-[0.2em] text-brass">
                {step.n}
              </span>
              <h3 className="mt-4 font-display text-2xl font-semibold text-cream">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.75] text-ash">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
