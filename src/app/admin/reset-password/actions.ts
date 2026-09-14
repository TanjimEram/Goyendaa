"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ResetState {
  error?: string;
}

const MIN_LENGTH = 8;

export async function updatePassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_LENGTH) {
    return { error: `Use at least ${MIN_LENGTH} characters.` };
  }
  if (password !== confirm) {
    return { error: "The two passwords don't match." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    // Supabase's messages here are safe to show: "should be different from
    // the old password", "too weak", "session expired".
    return { error: error.message };
  }

  // The recovery link signed us in; drop that session so the new password
  // gets used at least once, and so the reset page can't be revisited.
  await supabase.auth.signOut();
  redirect("/admin/login?reset=1");
}
