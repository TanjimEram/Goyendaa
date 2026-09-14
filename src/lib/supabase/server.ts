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

/**
 * Service-role client. Bypasses RLS — use ONLY in server code that has
 * already decided what it's allowed to do (order creation from the public
 * checkout, signed download URLs for a verified buyer). Never expose the key.
 */
export async function createServiceClient() {
  const { url } = getSupabaseEnv();
  const { requireEnv } = await import("@/lib/env");
  const key = await requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createBareClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
