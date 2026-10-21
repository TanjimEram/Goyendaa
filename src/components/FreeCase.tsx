"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { claimFreeCase, type ClaimState } from "@/app/cases/[slug]/free-actions";
import { FreeBadge } from "@/components/CaseCard";
import { Turnstile } from "@/components/Turnstile";

const INPUT =
  "mt-2 w-full border border-noir-line bg-noir px-4 py-3 font-sans text-base text-cream outline-none transition-colors duration-300 ease-noir placeholder:text-ash/50 focus:border-brass";
const LABEL = "block font-mono text-[10px] uppercase tracking-[0.18em] text-ash";
const PRIMARY =
  "group inline-flex w-full items-center justify-center gap-3 bg-blood px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY =
  "inline-flex w-full items-center justify-center gap-3 border border-brass px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-brass transition-colors duration-300 ease-noir hover:bg-brass hover:text-noir";

/** Fired by the pinned mobile bar so the panel opens its form. */
const PLAY_EVENT = "gyd:play";

/** The two buttons a lead gets: the PDF and (after solving) the answer. */
export function FreeCaseButtons({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col gap-3">
      <a href={`/cases/${slug}/download`} className={PRIMARY}>
        Download the case <span aria-hidden>&darr;</span>
      </a>
      <Link href={`/cases/${slug}/answer`} className={SECONDARY}>
        I&rsquo;ve solved it, show me the answer
      </Link>
    </div>
  );
}

/**
 * Name (optional), email (required), an unticked marketing checkbox,
 * Turnstile and a honeypot. `onClaimed` decides what success looks like.
 */
export function ClaimForm({
  slug,
  submitLabel,
  onClaimed,
}: {
  slug: string;
  submitLabel: string;
  onClaimed?: () => void;
}) {
  const [state, action, pending] = useActionState<ClaimState, FormData>(claimFreeCase, {});
  const v = state.values;

  // Once per new token. The callback lives in a ref: an inline arrow is a
  // new function every render, and AnswerGate's router.refresh() would loop.
  const claimed = useRef(onClaimed);
  useEffect(() => {
    claimed.current = onClaimed;
  });
  useEffect(() => {
    if (state.token) claimed.current?.();
  }, [state.token]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        defaultValue=""
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />
      <div>
        <label htmlFor={`fc-email-${slug}`} className={LABEL}>
          Email
        </label>
        <input
          id={`fc-email-${slug}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={v?.email ?? ""}
          aria-invalid={Boolean(state.fields?.email)}
          className={INPUT}
        />
        {state.fields?.email && (
          <p className="mt-1.5 border-l-2 border-blood pl-2 font-mono text-[11px] text-cream">{state.fields.email}</p>
        )}
      </div>
      <div>
        <label htmlFor={`fc-name-${slug}`} className={LABEL}>
          Name <span className="normal-case tracking-normal text-ash/70">(optional)</span>
        </label>
        <input
          id={`fc-name-${slug}`}
          name="name"
          autoComplete="given-name"
          maxLength={80}
          defaultValue={v?.name ?? ""}
          className={INPUT}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.6] text-ash">
        <input
          type="checkbox"
          name="consent"
          defaultChecked={v?.consent ?? false}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brass)]"
        />
        Send me new cases and weekly free puzzles.
      </label>
      <Turnstile resetKey={state} />
      {state.error && (
        <p role="alert" className="border-l-2 border-blood pl-3 text-sm text-cream">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={PRIMARY}>
        {pending ? "Opening the file…" : submitLabel}
      </button>
    </form>
  );
}

/**
 * Free case box on the case page (desktop aside; stacked on phones).
 * "Play free" opens the form; a lead who already claimed this case (cookie)
 * gets the two buttons instead.
 */
export function FreeCasePanel({ slug, claimed }: { slug: string; claimed: boolean }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(claimed);

  useEffect(() => {
    const openIt = () => setOpen(true);
    if (window.location.hash === "#play") openIt();
    window.addEventListener("hashchange", openIt);
    window.addEventListener(PLAY_EVENT, openIt);
    return () => {
      window.removeEventListener("hashchange", openIt);
      window.removeEventListener(PLAY_EVENT, openIt);
    };
  }, []);

  return (
    <aside
      id="play"
      aria-label="Play this case free"
      className="scroll-mt-24 border border-brass/60 bg-noir-raised p-6 lg:sticky lg:top-24 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">Case file</p>
          <p className="mt-1 font-display text-4xl text-brass">Free</p>
        </div>
        <FreeBadge />
      </div>

      <div className="mt-6">
        {done ? (
          <>
            <p className="mb-4 text-sm leading-[1.6] text-ash">
              The file is yours. Print it, solve it, and only then open the answer.
            </p>
            <FreeCaseButtons slug={slug} />
          </>
        ) : open ? (
          <ClaimForm slug={slug} submitLabel="Get the case file" onClaimed={() => setDone(true)} />
        ) : (
          <button type="button" onClick={() => setOpen(true)} className={PRIMARY}>
            Play free <span aria-hidden>&rarr;</span>
          </button>
        )}
      </div>
    </aside>
  );
}

/** Bottom-pinned bar for phones, like the paid PurchaseBar. */
export function FreeCaseBar({ code }: { code: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-noir-line bg-noir/90 px-5 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-ash">{code} &middot; Free case</p>
          <p className="font-display text-2xl leading-none text-brass">Free</p>
        </div>
        <a
          href="#play"
          onClick={() => window.dispatchEvent(new Event(PLAY_EVENT))}
          className="inline-flex shrink-0 items-center gap-2 bg-blood px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-cream"
        >
          Play free <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </div>
  );
}

/** The answer page's gate: same form; on success, re-render the page,
 *  which now finds the lead cookie and shows the answer. */
export function AnswerGate({ slug }: { slug: string }) {
  const router = useRouter();
  return <ClaimForm slug={slug} submitLabel="Show me the answer" onClaimed={() => router.refresh()} />;
}
