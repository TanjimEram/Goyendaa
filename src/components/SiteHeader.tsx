import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";

/* Section anchors are prefixed with "/" so they still resolve from /cases. */
const NAV_LINKS = [
  { label: "The Casebook", href: "/cases" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/faq" },
];
const CTA = { label: "Browse Cases", href: "/cases" };

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-noir-line/60 bg-noir/75 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-18 sm:px-8">
        {/* Wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo-mark.png"
            alt=""
            width={255}
            height={271}
            priority
            className="h-8 w-auto transition-opacity duration-300 ease-noir group-hover:opacity-80 sm:h-9"
          />
          <span className="font-display text-2xl font-semibold tracking-[0.14em] text-cream transition-colors duration-300 ease-noir group-hover:text-brass sm:text-[26px]">
            GOYENDA
          </span>
          <span
            lang="bn"
            className="hidden text-sm text-brass-dim transition-colors duration-300 ease-noir group-hover:text-brass sm:inline md:hidden lg:inline"
          >
            গোয়েন্দা
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition-colors duration-300 ease-noir hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* CTA — the only brass-filled element in the bar */}
          <Link
            href={CTA.href}
            className="hidden border border-brass px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-brass transition-all duration-300 ease-noir hover:bg-brass hover:text-noir sm:inline-block sm:px-5"
          >
            {CTA.label}
          </Link>
          <MobileNav links={NAV_LINKS} cta={CTA} />
        </div>
      </div>
    </header>
  );
}
