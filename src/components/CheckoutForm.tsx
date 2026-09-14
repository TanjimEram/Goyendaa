"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitManualPayment, type CheckoutState } from "@/app/checkout/[slug]/actions";
import { CopyButton } from "@/components/CopyButton";

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

/**
 * Step 2 of the manual bKash checkout: the buyer has (hopefully) sent the
 * money and now hands us the details we need to find it in the bKash app.
 */
export function CheckoutForm({
  orderId,
  orderCode,
  slug,
  bkashNumber,
  amount,
}: {
  orderId: string;
  orderCode: string;
  slug: string;
  bkashNumber: string;
  amount: number;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    submitManualPayment,
    {},
  );
  const f = state.fields ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label htmlFor="name" className={LABEL}>
          Your name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={v.name ?? ""}
          className={INPUT}
        />
        <FieldError message={f.name} />
      </div>

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
          defaultValue={v.email ?? ""}
          placeholder="you@example.com"
          className={INPUT}
        />
        {f.email ? (
          <FieldError message={f.email} />
        ) : (
          <p className="mt-1.5 text-xs text-ash/80">
            The download link and, later, the solution go here. Check it twice.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="trxid" className={LABEL}>
          bKash Transaction ID
        </label>
        <input
          id="trxid"
          name="trxid"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          maxLength={20}
          defaultValue={v.trxid ?? ""}
          placeholder="e.g. BJK7H2X9QT"
          className={`${INPUT} font-mono uppercase tracking-[0.12em]`}
        />
        {f.trxid ? (
          <FieldError message={f.trxid} />
        ) : (
          <p className="mt-1.5 text-xs text-ash/80">
            From the bKash confirmation SMS or the app&rsquo;s transaction
            history &mdash; labelled &ldquo;TrxID&rdquo;.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="code" className={LABEL}>
          Order code
        </label>
        <input
          id="code"
          name="code"
          autoComplete="off"
          required
          defaultValue={v.code ?? ""}
          placeholder={orderCode}
          className={`${INPUT} font-mono uppercase tracking-[0.12em]`}
        />
        {f.code ? (
          <FieldError message={f.code} />
        ) : (
          <p className="mt-1.5 text-xs text-ash/80">
            Re-type <span className="font-mono text-cream">{orderCode}</span>{" "}
            to confirm this is the payment you just sent.
          </p>
        )}
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
        {pending ? "Submitting…" : "I've sent the money"}
        {!pending && (
          <span aria-hidden className="transition-transform duration-300 ease-noir group-hover:translate-x-1">
            &rarr;
          </span>
        )}
      </button>

      <p className="text-xs leading-[1.7] text-ash">
        Haven&rsquo;t sent it yet? Send ৳ {amount} to{" "}
        <span className="font-mono text-cream">{bkashNumber}</span>{" "}
        <CopyButton value={bkashNumber} label="copy" /> first, then come back.
        By submitting you accept the{" "}
        <Link href="/terms" target="_blank" className="text-cream underline underline-offset-4 hover:text-brass">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/refunds" target="_blank" className="text-cream underline underline-offset-4 hover:text-brass">
          refund policy
        </Link>
        .
      </p>
    </form>
  );
}
