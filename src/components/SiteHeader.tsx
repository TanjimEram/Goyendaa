const NAV_LINKS = [
  { label: "The Casebook", href: "#casebook" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-noir-line/60 bg-noir/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-18 sm:px-8">
        {/* Wordmark */}
        <a href="#top" className="group flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-semibold tracking-[0.14em] text-cream transition-colors duration-300 ease-noir group-hover:text-brass sm:text-[26px]">
            GOYENDA
          </span>
          <span
            lang="bn"
            className="hidden text-sm text-brass-dim transition-colors duration-300 ease-noir group-hover:text-brass sm:inline"
          >
            গোয়েন্দা
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition-colors duration-300 ease-noir hover:text-cream"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA — the only brass-filled element in the bar */}
        <a
          href="#casebook"
          className="border border-brass px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-brass transition-all duration-300 ease-noir hover:bg-brass hover:text-noir sm:px-5"
        >
          Browse Cases
        </a>
      </div>
    </header>
  );
}
