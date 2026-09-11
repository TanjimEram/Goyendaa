import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/admin/login/actions";
import { createClient } from "@/lib/supabase/server";

// Every admin page reads live data and depends on the session cookie.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { template: "%s — Goyenda Admin", default: "Goyenda Admin" },
  robots: { index: false, follow: false },
};

/**
 * Wraps every /admin route except /admin/login. The proxy already bounced
 * anonymous visitors; this is the authoritative server-side check.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const email = typeof data.claims.email === "string" ? data.claims.email : "";

  return (
    <div className="flex min-h-svh flex-col bg-noir text-cream">
      <header className="border-b border-noir-line bg-noir-raised/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-lg font-semibold tracking-[0.14em] text-cream"
            >
              GOYENDA
              <span className="ml-2 font-mono text-[10px] font-normal tracking-[0.2em] text-brass">
                ADMIN
              </span>
            </Link>
            <nav className="hidden items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash sm:flex">
              <Link href="/admin" className="hover:text-cream">
                Cases
              </Link>
              <Link href="/" className="hover:text-cream" target="_blank">
                View site &nearr;
              </Link>
            </nav>
          </div>
          <form action={logout} className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] text-ash sm:inline">
              {email}
            </span>
            <button
              type="submit"
              className="border border-noir-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:border-brass hover:text-cream"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        {children}
      </main>
    </div>
  );
}
