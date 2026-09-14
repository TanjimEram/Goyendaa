import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const LOGIN_PATH = "/admin/login";

/** Admin routes that must work without a session: the sign-in page, the
 *  forgot-password form, and the reset page + the route the recovery
 *  email lands on. Everything else under /admin is guarded. */
function isPublicAdminPath(pathname: string) {
  return (
    pathname === LOGIN_PATH ||
    pathname === "/admin/forgot-password" ||
    pathname.startsWith("/admin/reset-password")
  );
}

/** Cookie that ties a browser to its open checkout reservations. */
export const CHECKOUT_SESSION_COOKIE = "gyd_cs";

/**
 * Two jobs:
 *
 * /checkout/* — plants a random checkout-session cookie if the browser has
 * none, so the checkout page can reserve ONE order code per session+case
 * and a refresh doesn't mint a new one. Forwarded on the request too, so
 * the very first render already sees it.
 *
 * /admin/*   — refreshes the Supabase session cookie and bounces
 * unauthenticated visitors to the login page (except the sign-in /
 * forgot / reset pages, which are public by nature). This is the optimistic check
 * (JWT verified locally via getClaims, no database round-trip). The
 * dashboard layout repeats the check server-side, and RLS is the real wall.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/checkout")) {
    if (request.cookies.has(CHECKOUT_SESSION_COOKIE)) return NextResponse.next();
    const id = crypto.randomUUID();
    request.cookies.set(CHECKOUT_SESSION_COOKIE, id);
    const res = NextResponse.next({ request });
    res.cookies.set(CHECKOUT_SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

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

  if (!signedIn && !isPublicAdminPath(pathname)) {
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
  matcher: ["/admin/:path*", "/checkout/:path*"],
};
