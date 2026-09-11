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
