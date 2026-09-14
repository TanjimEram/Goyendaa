"use server";

import { headers } from "next/headers";
import { SITE } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export interface ForgotState {
  /** True once a request was made — the form swaps to the generic notice. */
  sent?: boolean;
  error?: string;
}

/**
 * Where the recovery email link lands. Must be allow-listed in Supabase →
 * Authentication → URL Configuration → Redirect URLs for every origin
 * (localhost and the live site).
 */
const RESET_CONFIRM_PATH = "/admin/reset-password/confirm";

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter the admin email address." };

  // Build the redirect from the request origin so local dev lands on
  // localhost and production lands on the deployed site.
  const origin = (await headers()).get("origin") ?? SITE.url;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}${RESET_CONFIRM_PATH}`,
  });

  // Never tell the form whether the address exists. Supabase already
  // answers "ok" for unknown emails; rate limits and SMTP failures are the
  // only real errors, and those go to the server log, not the page.
  if (error) console.warn("[auth] password reset request failed:", error.message);

  return { sent: true };
}
