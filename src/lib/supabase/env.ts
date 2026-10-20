/**
 * Supabase connection settings.
 *
 * Both values are public by design — the anon/publishable key is meant to
 * ship in the browser bundle; Row Level Security is what protects data.
 * They are NEXT_PUBLIC_ so Next inlines them at build time, which means on
 * Cloudflare they must be set as *build* variables (see CLAUDE.md).
 *
 * Read lazily, never at module load, so `next build` succeeds without them
 * and the error surfaces where it's actionable: on the first request.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).",
    );
  }
  return { url, key };
}

/**
 * Auth-cookie settings for every Supabase client (browser, server, proxy).
 * Library default is 400 days, no Secure flag. A week, sliding: the proxy
 * re-sets it on every refresh, so only an idle admin has to sign in again.
 *
 * httpOnly has to stay off — the admin's browser client reads the session
 * to upload straight to Storage. The CSP in proxy.ts is what keeps an
 * injected script from ever running to read it.
 */
export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
} as const;
