import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for the recovery email link. Turns the one-time token into
 * a session cookie, then sends the browser on to the new-password form.
 *
 * Accepts either shape Supabase can produce:
 *   ?code=…                        default template ({{ .ConfirmationURL }})
 *                                  after the PKCE hop through /auth/v1/verify
 *   ?token_hash=…&type=recovery    the SSR-recommended template that links
 *                                  here directly (survives link scanners)
 *
 * Cookies set here are attached to the redirect, which is why this is a
 * route handler and not the page itself — a Server Component can't write
 * cookies.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");

  const dest = request.nextUrl.clone();
  dest.pathname = "/admin/reset-password";
  dest.search = "";

  const supabase = await createClient();
  let failure: string | undefined;

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    failure = error?.message;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failure = error?.message;
  } else {
    // Supabase reports an expired/used link as ?error=…&error_description=…
    failure = params.get("error_description") ?? "no recovery token in the URL";
  }

  if (failure) {
    console.warn("[auth] recovery link rejected:", failure);
    dest.searchParams.set("error", "expired");
  }

  return NextResponse.redirect(dest);
}
