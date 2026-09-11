import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const LOGIN_PATH = "/admin/login";

/**
 * Guards /admin. Refreshes the Supabase session cookie on every admin
 * request and bounces unauthenticated visitors to the login page.
 *
 * This is the optimistic check (JWT verified locally via getClaims, no
 * database round-trip). The dashboard layout repeats the check server-side,
 * and RLS is the real wall — so a bypass here leaks nothing.
 */
export async function proxy(request: NextRequest) {
  const { url, key } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // Re-create the response so the refreshed cookies reach the browser.
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not put code between createServerClient and this call — it must run
  // first so the session refresh happens before anything reads it.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const onLoginPage = pathname === LOGIN_PATH;

  if (!signedIn && !onLoginPage) {
    const login = request.nextUrl.clone();
    login.pathname = LOGIN_PATH;
    login.search = "";
    return NextResponse.redirect(login);
  }

  if (signedIn && onLoginPage) {
    const home = request.nextUrl.clone();
    home.pathname = "/admin";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
