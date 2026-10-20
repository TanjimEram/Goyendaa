import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_OPTIONS, getSupabaseEnv } from "@/lib/supabase/env";

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

const TURNSTILE = "https://challenges.cloudflare.com";

/**
 * Nonce-based CSP. Next reads the nonce from the request header during
 * render and stamps it on its own scripts; 'strict-dynamic' lets those load
 * the rest. Anything injected without the nonce doesn't run — which also
 * protects the admin's (necessarily non-httpOnly) Supabase session cookie.
 * Styles stay 'unsafe-inline': next/image and a few components use inline
 * style attributes, and style injection can't read cookies.
 */
function contentSecurityPolicy(nonce: string, https: boolean): string {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : "";
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabase}`,
    "font-src 'self' data:",
    `connect-src 'self' ${supabase} ${TURNSTILE}`,
    `media-src 'self' ${supabase}`,
    `frame-src ${TURNSTILE}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/**
 * Every page: a fresh CSP nonce (see above). Then two route-specific jobs:
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
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce, request.nextUrl.protocol === "https:");
  // On the request so the render picks the nonce up, on the response so the
  // browser enforces it. Every branch below must forward `request`.
  request.headers.set("content-security-policy", csp);
  const response = await route(request);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

async function route(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/checkout")) return checkout(request);
  if (pathname.startsWith("/admin")) return admin(request);
  return NextResponse.next({ request });
}

function checkout(request: NextRequest): NextResponse {
  if (request.cookies.has(CHECKOUT_SESSION_COOKIE)) return NextResponse.next({ request });
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

async function admin(request: NextRequest): Promise<NextResponse> {
  const { url, key } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
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
  // Every page; not API routes, build assets, or files with an extension
  // (icons, robots.txt, images in public/).
  matcher: ["/((?!api/|_next/static|_next/image|.*\\..*).*)"],
};
