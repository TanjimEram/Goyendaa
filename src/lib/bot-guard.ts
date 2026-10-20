import "server-only";

import { headers } from "next/headers";
import { serverEnv } from "@/lib/env";
import { logError } from "@/lib/log";
import { createServiceClient } from "@/lib/supabase/server";

/** The visitor's IP as Cloudflare saw it. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

/**
 * Cloudflare Turnstile check for a submitted form. Off (always true) until
 * BOTH keys exist — the site key is a build variable, the secret a Worker
 * secret — so a half-configured deploy can't lock everyone out.
 */
export async function passesTurnstile(formData: FormData, ip: string): Promise<boolean> {
  const secret = await serverEnv("TURNSTILE_SECRET_KEY");
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return true;
  const token = formData.get("cf-turnstile-response");
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    logError("[turnstile] verify failed", error);
    return false;
  }
}

// ── Admin login throttle (table from migration 0010) ─────────────────

const WINDOW_MIN = 15;
const MAX_PER_IP = 5;
/** Per account, across IPs: slows a distributed guess at the one admin. */
const MAX_PER_EMAIL = 10;

async function emailKey(email: string): Promise<string> {
  // Hashed: the table never holds what strangers typed into the form.
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.toLowerCase()));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * True when this IP or account has failed too often lately. Fails open
 * (logs, returns false) if the table is missing, so a forgotten migration
 * can't lock the admin out — Supabase's own auth rate limit still applies.
 */
export async function loginBlocked(ip: string, email: string): Promise<boolean> {
  try {
    const supabase = await createServiceClient();
    const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
    const count = async (col: "ip" | "email_hash", value: string) => {
      const { count, error } = await supabase
        .from("login_attempts")
        .select("id", { count: "exact", head: true })
        .eq(col, value)
        .gte("at", since);
      if (error) throw error;
      return count ?? 0;
    };
    const [byIp, byEmail] = await Promise.all([count("ip", ip), count("email_hash", await emailKey(email))]);
    return byIp >= MAX_PER_IP || byEmail >= MAX_PER_EMAIL;
  } catch (error) {
    logError("[login] throttle check failed", error);
    return false;
  }
}

export async function recordLoginFailure(ip: string, email: string): Promise<void> {
  try {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("login_attempts")
      .insert({ ip, email_hash: await emailKey(email) });
    if (error) throw error;
  } catch (error) {
    logError("[login] recording failure failed", error);
  }
}

/** Cron housekeeping. */
export async function purgeLoginAttempts(): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("login_attempts")
    .delete()
    .lt("at", new Date(Date.now() - 86_400_000).toISOString());
  if (error) throw error;
}

export const LOGIN_BLOCKED_MESSAGE = `Too many sign-in attempts. Wait ${WINDOW_MIN} minutes and try again.`;
