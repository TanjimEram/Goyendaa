import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Cookie-aware server client for Server Components, Server Actions and
 * Route Handlers. Carries the admin's session, so RLS sees `authenticated`.
 */
export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Fine: proxy.ts refreshes the session cookie on the way in.
        }
      },
    },
  });
}

/**
 * Anonymous client for the public site. No cookies, no session — reads
 * only what RLS exposes to `anon` (published cases). Kept separate so the
 * public pages never depend on request cookies.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createBareClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
