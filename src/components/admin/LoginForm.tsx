"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";

const INPUT =
  "mt-2 w-full border border-noir-line bg-noir-raised px-4 py-3 font-sans text-base text-cream outline-none transition-colors duration-300 ease-noir placeholder:text-ash/60 focus:border-brass";
const LABEL = "block font-mono text-[10px] uppercase tracking-[0.18em] text-ash";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <main className="flex min-h-svh items-center justify-center bg-noir px-5 py-16">
      <div className="w-full max-w-sm border border-noir-line bg-noir-raised p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Goyenda &middot; Admin
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-cream">
          Identify yourself.
        </h1>

        <form action={action} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="email" className={LABEL}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="password" className={LABEL}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={INPUT}
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="border-l-2 border-blood pl-3 font-mono text-[11px] leading-relaxed text-cream"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-brass px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-noir transition-colors duration-300 ease-noir hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
