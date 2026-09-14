"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";
import {
  AUTH_BUTTON,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK,
  AuthCard,
  AuthError,
  AuthNotice,
} from "@/components/admin/AuthCard";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <AuthCard title="Identify yourself.">
      <form action={action} className="mt-8 flex flex-col gap-5">
        {notice && <AuthNotice>{notice}</AuthNotice>}
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
        <div>
          <label htmlFor="password" className={AUTH_LABEL}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={AUTH_INPUT}
          />
        </div>

        {state.error && <AuthError>{state.error}</AuthError>}

        <button type="submit" disabled={pending} className={AUTH_BUTTON}>
          {pending ? "Checking…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-right">
        <Link href="/admin/forgot-password" className={AUTH_LINK}>
          Forgot password?
        </Link>
      </p>
    </AuthCard>
  );
}
