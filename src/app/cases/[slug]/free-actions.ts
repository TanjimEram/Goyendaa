"use server";

import { cookies } from "next/headers";
import { inBackground } from "@/lib/background";
import { clientIp, ipLimited, passesTurnstile } from "@/lib/bot-guard";
import { freeCaseMail, sendMail } from "@/lib/email";
import { answerLocked, getFreeCase, leadCookie, upsertLead } from "@/lib/leads";
import { logError } from "@/lib/log";
import { formatDateTimeBD } from "@/lib/orders";
import { SITE } from "@/lib/site";
import { UTM_COOKIE, utmFromCookie } from "@/lib/utm";

export interface ClaimState {
  error?: string;
  fields?: { email?: string; name?: string };
  values?: { name: string; email: string; consent: boolean };
  /** Set on success: the lead's token (also stored in the case cookie). */
  token?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_IP_PER_HOUR = 10;
const UNAVAILABLE = "We couldn't reach our system just now. Try again in a minute.";

/**
 * "Play free": store the lead (same email + case = update), remember it in
 * an httpOnly cookie for this case, email the links once, and hand the page
 * the token so it can show the download and answer buttons straight away.
 * Never touches orders or the paid checkout.
 */
export async function claimFreeCase(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const consent = formData.get("consent") === "on";
  const values = { name, email, consent };

  // Honeypot: only bots fill it. Say nothing useful, save nothing.
  if (String(formData.get("website") ?? "")) return { error: UNAVAILABLE, values };

  if (!EMAIL.test(email) || email.length > 254) {
    return { fields: { email: "A working email — the download link goes here too." }, values };
  }

  let freeCase;
  try {
    freeCase = await getFreeCase(slug);
  } catch (error) {
    logError("[free] case lookup failed", error);
    return { error: UNAVAILABLE, values };
  }
  if (!freeCase) return { error: "This case isn't available any more.", values };

  const ip = await clientIp();
  if (!(await passesTurnstile(formData, ip))) {
    return { error: "Couldn't confirm you're human. Wait a moment and press the button again.", values };
  }
  if (await ipLimited("free-claim", ip, MAX_PER_IP_PER_HOUR, 60)) {
    return { error: "Too many requests from your connection. Try again in an hour.", values };
  }

  const jar = await cookies();
  let lead;
  try {
    lead = await upsertLead({
      email,
      name: name || null,
      caseId: freeCase.id,
      caseSlug: freeCase.slug,
      consent,
      utm: utmFromCookie(jar.get(UTM_COOKIE)?.value),
    });
  } catch (error) {
    logError("[free] lead save failed", error);
    return { error: UNAVAILABLE, values };
  }

  jar.set(leadCookie(freeCase.slug), lead.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // The links by email too, once per new lead (a resubmit already has the
  // buttons on screen, and resending would let anyone mail-bomb an address).
  // Skipped quietly by sendMail when no email provider is configured.
  if (lead.created) {
    const base = `${SITE.url}/cases/${freeCase.slug}`;
    const locked = answerLocked(freeCase.answer_unlock_at);
    await inBackground(
      sendMail({
        to: email,
        ...freeCaseMail({
          name: name || null,
          caseTitle: freeCase.title,
          downloadUrl: `${base}/download?t=${lead.token}`,
          answerUrl: `${base}/answer?t=${lead.token}`,
          answerUnlocksText: locked ? formatDateTimeBD(freeCase.answer_unlock_at!) : null,
          unsubscribeUrl: `${SITE.url}/unsubscribe?t=${lead.token}`,
        }),
      }),
    );
  }

  return { token: lead.token, values };
}
