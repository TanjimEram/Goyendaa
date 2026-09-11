"use client";

import { useState, useTransition } from "react";
import { deleteCase } from "@/app/admin/(dashboard)/cases/actions";

/**
 * Two-step delete: the first click swaps the button for an inline
 * "Delete <title>?" confirm/cancel pair; only the second click submits.
 */
export function DeleteCaseButton({ id, title }: { id: string; title: string }) {
  const [arming, setArming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!arming) {
    return (
      <button
        type="button"
        onClick={() => setArming(true)}
        className="border border-noir-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:border-blood hover:text-cream"
      >
        Delete
      </button>
    );
  }

  return (
    <form
      action={(fd) => startTransition(() => deleteCase(fd))}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <span className="max-w-[14rem] truncate font-mono text-[10px] text-cream">
        Delete “{title}”?
      </span>
      <button
        type="submit"
        disabled={pending}
        className="bg-blood px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream hover:bg-blood-hot disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setArming(false)}
        disabled={pending}
        className="border border-noir-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash hover:text-cream"
      >
        Cancel
      </button>
    </form>
  );
}
