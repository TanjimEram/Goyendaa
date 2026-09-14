"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  type ForgotState,
} from "@/app/admin/forgot-password/actions";
import {
  AUTH_BUTTON,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK,
  AuthCard,
  AuthError,
  AuthNotice,
} from "@/components/admin/AuthCard";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <AuthCard title="Lost your key?">
      {state.sent ? (
        <div className="mt-8">
          <AuthNotice>
            If that email is registered, a reset link has been sent. It expires
            in an hour — check spam if it hasn&rsquo;t arrived in a few minutes.
          </AuthNotice>
        </div>
      ) : (
        <form action={action} className="mt-8 flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-ash">
            Enter the admin email and a one-time link to set a new password
            will be sent there.
          </p>
          <div>
            <label htmlFor="email" className={AUTH_LABEL}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={AUTH_INPUT}
            />
          </div>

          {state.error && <AuthError>{state.error}</AuthError>}

          <button type="submit" disabled={pending} className={AUTH_BUTTON}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-right">
        <Link href="/admin/login" className={AUTH_LINK}>
          &larr; Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
