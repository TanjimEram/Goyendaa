"use client";

import { useState } from "react";

/** Tiny inline "copy" affordance for numbers and codes. Degrades to nothing
 *  useful-looking if the clipboard API is unavailable (old browsers, http). */
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard blocked — the value is visible anyway */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${value}`}
      className="inline-flex items-center border border-noir-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:border-brass hover:text-cream"
    >
      {done ? "Copied" : label}
    </button>
  );
}
