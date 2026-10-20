"use server";

import { redirect } from "next/navigation";
import {
  LOGIN_BLOCKED_MESSAGE,
  clientIp,
  loginBlocked,
  passesTurnstile,
  recordLoginFailure,
} from "@/lib/bot-guard";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are both required." };
  }

  const ip = await clientIp();
  if (await loginBlocked(ip, email)) return { error: LOGIN_BLOCKED_MESSAGE };
  if (!(await passesTurnstile(formData, ip))) {
    return { error: "Couldn't confirm you're human. Wait a moment and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await recordLoginFailure(ip, email);
    // Don't echo Supabase's message — it distinguishes "no such user" from
    // "wrong password", which is more than a login form should reveal.
    return { error: "Those credentials didn't check out." };
  }

  // redirect() throws, so it must sit outside any try/catch.
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
