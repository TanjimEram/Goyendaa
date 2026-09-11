"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Browser client. Shares the auth cookies written by the server, so after
 * the admin signs in (server action) this client is already authenticated —
 * which is what lets the admin form upload straight to Storage from the
 * browser instead of streaming files through the Worker.
 */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
