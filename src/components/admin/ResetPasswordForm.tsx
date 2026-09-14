"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updatePassword,
  type ResetState,
} from "@/app/admin/reset-password/actions";
import {
  AUTH_BUTTON,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK,
  AuthCard,
  AuthError,
} from "@/components/admin/AuthCard";

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    updatePassword,
    {},
  );

  return (
    <AuthCard title="Set a new password.">
      <form action={action} className="mt-8 flex flex-col gap-5">
        {email && (
          <p className="font-mono text-[11px] text-ash">
            for <span className="text-cream">{email}</span>
          </p>
        )}
        {/* Hidden username helps password managers file the new secret. */}
        <input type="hidden" name="username" autoComplete="username" value={email} readOnly />
        <div>
          <label htmlFor="password" className={AUTH_LABEL}>
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={AUTH_INPUT}
          />
        </div>
        <div>
          <label htmlFor="confirm" className={AUTH_LABEL}>
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={AUTH_INPUT}
          />
        </div>

        {state.error && <AuthError>{state.error}</AuthError>}

        <button type="submit" disabled={pending} className={AUTH_BUTTON}>
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-right">
        <Link href="/admin/login" className={AUTH_LINK}>
          &larr; Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
