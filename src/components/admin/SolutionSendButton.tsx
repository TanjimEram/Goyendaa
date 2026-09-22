"use client";

import { useActionState } from "react";
import { resendSolution, type OrderActionState } from "@/app/admin/(dashboard)/orders/actions";

/**
 * Sends one paid order's solution on demand. The cron handles the normal
 * case; this is for a buyer who lost the email, or a send that failed
 * (usually a missing solution PDF) and has since been fixed.
 */
export function SolutionSendButton({
  orderId,
  alreadySent,
  error,
}: {
  orderId: string;
  alreadySent: boolean;
  /** Last failure recorded by the job, if any. */
  error?: string | null;
}) {
  const [state, action, pending] = useActionState<OrderActionState, FormData>(
    resendSolution,
    {},
  );

  return (
    <form action={action} className="mt-2 flex flex-col items-start gap-1.5">
      <input type="hidden" name="id" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="border border-noir-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:border-brass hover:text-cream disabled:opacity-50"
      >
        {pending ? "Sending…" : alreadySent ? "Send again" : "Send now"}
      </button>
      {error && !state.error && !state.warning && (
        <span className="max-w-[14rem] font-mono text-[10px] leading-relaxed text-ash">
          Last attempt: {error}
        </span>
      )}
      {state.error && (
        <span role="alert" className="max-w-[14rem] border-l-2 border-blood pl-2 font-mono text-[10px] leading-relaxed text-cream">
          {state.error}
        </span>
      )}
      {state.warning && (
        <span role="status" className="max-w-[14rem] border-l-2 border-brass pl-2 font-mono text-[10px] leading-relaxed text-cream">
          {state.warning}
        </span>
      )}
    </form>
  );
}
