import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

/** `?reset=1` is set by the password-reset action after it signs out. */
export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { reset } = await searchParams;
  const notice =
    reset === "1" ? "Password updated. Sign in with the new one." : undefined;
  return <LoginForm notice={notice} />;
}
