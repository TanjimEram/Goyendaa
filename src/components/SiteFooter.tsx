import Link from "next/link";
import { RANKS, RANK_ORDER } from "@/lib/cases";

const FOOTER_COLUMNS = [
  {
    heading: "Cases",
    links: [
      { label: "All cases", href: "/cases" },
      ...RANK_ORDER.map((rank) => ({
        label: RANKS[rank].label,
        href: `/cases?rank=${rank}`,
      })),
    ],
  },
  {
    heading: "Goyenda",
    links: [
      { label: "About", href: "/#about" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund policy", href: "/refunds" },
      { label: "Licence & fair use", href: "/terms#licence" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-noir-line bg-noir-raised/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl font-semibold tracking-[0.14em] text-cream">
                GOYENDA
              </span>
              <span lang="bn" className="text-sm text-brass-dim">
                গোয়েন্দা
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-[1.75] text-ash">
              Printable detective case files. Fictional cases, real
              investigative work &mdash; made in Dhaka.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading}>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
                {column.heading}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ash transition-colors duration-300 ease-noir hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-5 border-t border-noir-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            &copy; {year} Goyenda &middot; All cases are works of fiction
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            Payments coming soon:{" "}
            <span className="text-brass-dim">bKash &middot; Nagad &middot; Card</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
