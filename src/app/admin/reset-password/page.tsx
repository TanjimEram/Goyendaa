import type { Metadata } from "next";
import Link from "next/link";
import { AUTH_LINK, AuthCard, AuthError } from "@/components/admin/AuthCard";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

/**
 * Reached from /admin/reset-password/confirm once the recovery token has
 * become a session. With no session (link expired, already used, or someone
 * typed the URL) it shows the dead-end card instead of the form.
 */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/admin/reset-password">) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <AuthCard title="That link's gone cold.">
        <div className="mt-8 flex flex-col gap-5">
          <AuthError>
            {error === "expired"
              ? "This reset link has expired or was already used."
              : "No valid reset link was found. Links are one-time and expire after an hour."}
          </AuthError>
          <Link href="/admin/forgot-password" className={AUTH_LINK}>
            Request a new link &rarr;
          </Link>
        </div>
      </AuthCard>
    );
  }

  const email = typeof data.claims.email === "string" ? data.claims.email : "";
  return <ResetPasswordForm email={email} />;
}
