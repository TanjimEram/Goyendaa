"use client";

import Link from "next/link";
import { useActionState } from "react";
import { startCheckout, type CheckoutState } from "@/app/checkout/[slug]/actions";
import { formatTaka } from "@/lib/cases";
import { PAYMENT_METHODS, PAYMENT_METHOD_ORDER } from "@/lib/payments";

const INPUT =
  "mt-2 w-full border border-noir-line bg-noir-raised px-4 py-3 font-sans text-base text-cream outline-none transition-colors duration-300 ease-noir placeholder:text-ash/50 focus:border-brass";
const LABEL = "block font-mono text-[10px] uppercase tracking-[0.18em] text-ash";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 border-l-2 border-blood pl-2 font-mono text-[11px] text-cream">
      {message}
    </p>
  );
}

export function CheckoutForm({
  slug,
  title,
  amount,
  solutionDelayHours,
}: {
  slug: string;
  title: string;
  amount: number;
  solutionDelayHours: number;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    startCheckout,
    {},
  );
  const f = state.fields ?? {};

  if (state.unavailable) {
    return (
      <div className="relative border border-brass bg-noir-raised p-6 shadow-stamp sm:p-8">
        <span
          aria-hidden
          className="absolute -top-4 right-5 rotate-[6deg] border-[3px] border-blood px-3 py-1 font-mono text-sm font-semibold tracking-[0.14em] text-blood"
        >
          NOT YET
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Checkout
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-cream">
          Payments aren&rsquo;t open yet.
        </h2>
        <p className="mt-4 text-sm leading-[1.75] text-ash">
          Everything else is ready &mdash; the file, the delay, the delivery.
          We&rsquo;re finishing the bKash and Nagad connection. When it opens,
          this page will take you straight to payment, the case PDF will
          download the moment it clears, and the solution will follow{" "}
          {solutionDelayHours} hour{solutionDelayHours === 1 ? "" : "s"} later
          to <span className="text-cream">{state.email}</span>.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-[0.16em]">
          <Link href={`/cases/${slug}`} className="text-ash hover:text-brass">
            &larr; Back to {title}
          </Link>
          <Link href="/cases" className="text-ash hover:text-brass">
            The Casebook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label htmlFor="email" className={LABEL}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={state.email ?? ""}
          placeholder="you@example.com"
          className={INPUT}
        />
        {f.email ? (
          <FieldError message={f.email} />
        ) : (
          <p className="mt-1.5 text-xs text-ash/80">
            The case file link and, later, the solution go here. No account
            needed.
          </p>
        )}
      </div>

      <fieldset>
        <legend className={LABEL}>Pay with</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {PAYMENT_METHOD_ORDER.map((m, i) => (
            <label
              key={m}
              className="flex cursor-pointer items-start gap-3 border border-noir-line bg-noir-raised px-4 py-3 transition-colors has-[:checked]:border-brass"
            >
              <input
                type="radio"
                name="method"
                value={m}
                defaultChecked={i === 0}
                className="mt-1 accent-[var(--color-brass)]"
              />
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-cream">
                  {PAYMENT_METHODS[m].label}
                </span>
                <span className="block text-xs text-ash">{PAYMENT_METHODS[m].hint}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError message={f.method} />
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="terms"
            className="mt-1 accent-[var(--color-brass)]"
          />
          <span className="text-xs leading-[1.7] text-ash">
            I understand this is a digital file with no refunds once downloaded,
            that the solution arrives by email on a delay, and that every case is
            a work of fiction.{" "}
            <Link href="/terms" target="_blank" className="text-cream underline underline-offset-4 hover:text-brass">
              Terms
            </Link>{" "}
            &middot;{" "}
            <Link href="/refunds" target="_blank" className="text-cream underline underline-offset-4 hover:text-brass">
              Refunds
            </Link>
          </span>
        </label>
        <FieldError message={f.terms} />
      </div>

      {state.error && (
        <p role="alert" className="border-l-2 border-blood pl-3 font-mono text-[11px] text-cream">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center justify-center gap-3 bg-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "One moment…" : `Pay ${formatTaka(amount)}`}
        {!pending && (
          <span aria-hidden className="transition-transform duration-300 ease-noir group-hover:translate-x-1">
            &rarr;
          </span>
        )}
      </button>

      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
        Secure payment via a Bangladesh aggregator &middot; ৳ only
      </p>
    </form>
  );
}
