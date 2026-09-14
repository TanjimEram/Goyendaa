"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Hamburger + slide-down panel for viewports below `md`. Pure state, no
 * dependency. Closes on Escape, on click-away, and when a link is tapped —
 * which covers every way the route can change while it's open.
 */
export function MobileNav({
  links,
  cta,
}: {
  links: NavLink[];
  cta: NavLink;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // Lock page scroll while the panel is up.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-noir-line text-cream transition-colors hover:border-brass"
      >
        <span
          aria-hidden
          className={`block h-px w-4 bg-current transition-transform duration-300 ease-noir ${
            open ? "translate-y-[6px] rotate-45" : ""
          }`}
        />
        <span
          aria-hidden
          className={`block h-px w-4 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
        />
        <span
          aria-hidden
          className={`block h-px w-4 bg-current transition-transform duration-300 ease-noir ${
            open ? "-translate-y-[6px] -rotate-45" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-noir-line bg-noir shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
      >
        <nav className="mx-auto flex max-w-6xl flex-col px-5 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-noir-line py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:text-brass"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex items-center justify-center gap-3 bg-blood px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors hover:bg-blood-hot"
          >
            {cta.label} <span aria-hidden>&rarr;</span>
          </Link>
        </nav>
      </div>

      {/* Click-away scrim below the panel. */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-16 -z-10 cursor-default bg-noir/60"
        />
      )}
    </div>
  );
}
