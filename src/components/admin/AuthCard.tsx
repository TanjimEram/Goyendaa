import type { ReactNode } from "react";

export const AUTH_INPUT =
  "mt-2 w-full border border-noir-line bg-noir-raised px-4 py-3 font-sans text-base text-cream outline-none transition-colors duration-300 ease-noir placeholder:text-ash/60 focus:border-brass";
export const AUTH_LABEL = "block font-mono text-[10px] uppercase tracking-[0.18em] text-ash";
export const AUTH_BUTTON =
  "mt-2 bg-brass px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-noir transition-colors duration-300 ease-noir hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60";
export const AUTH_LINK =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-ash underline-offset-4 hover:text-cream hover:underline";

/** Red-rule error line shared by the admin auth forms. */
export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="border-l-2 border-blood pl-3 font-mono text-[11px] leading-relaxed text-cream">
      {children}
    </p>
  );
}

/** Brass-rule notice line (success / neutral information). */
export function AuthNotice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="border-l-2 border-brass pl-3 font-mono text-[11px] leading-relaxed text-cream">
      {children}
    </p>
  );
}

/**
 * The centred card every unauthenticated admin page sits in — sign in,
 * forgot password, reset password. Keeps them visually one family.
 */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-noir px-5 py-16">
      <div className="w-full max-w-sm border border-noir-line bg-noir-raised p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Goyenda &middot; Admin
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-cream">{title}</h1>
        {children}
      </div>
    </main>
  );
}
