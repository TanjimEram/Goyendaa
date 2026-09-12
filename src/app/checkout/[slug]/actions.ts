"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPublishedCase } from "@/lib/cases-data";
import { getPaymentProvider, isPaymentMethod } from "@/lib/payments";

export interface CheckoutState {
  /** Form-level message. */
  error?: string;
  /** Field-level messages, keyed by input name. */
  fields?: Record<string, string>;
  /** No payment provider is live — show the "not open yet" panel. */
  unavailable?: boolean;
  /** Echoed back so the form can keep what the buyer typed. */
  email?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const slug = String(formData.get("slug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const method = String(formData.get("method") ?? "");
  const agreed = formData.get("terms") === "on";

  const fields: Record<string, string> = {};
  if (!EMAIL.test(email)) fields.email = "Enter a valid email — the case file and solution go there.";
  if (!isPaymentMethod(method)) fields.method = "Pick how you'd like to pay.";
  if (!agreed) fields.terms = "Please confirm you've read the terms.";
  if (Object.keys(fields).length) {
    return { fields, email, error: "Fix the fields marked below." };
  }

  // Re-read the case server-side: the price on the form is display only.
  const caseFile = await getPublishedCase(slug);
  if (!caseFile?.id) return { error: "That case isn't available any more.", email };

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const origin = host ? `${proto}://${host}` : "";

  const result = await getPaymentProvider().createCheckout({
    caseId: caseFile.id,
    caseSlug: caseFile.slug,
    caseTitle: caseFile.title,
    amount: caseFile.priceBdt,
    email,
    method: method as never,
    origin,
  });

  switch (result.status) {
    case "redirect":
      redirect(result.url);
    case "error":
      return { error: result.message, email };
    case "unavailable":
      return { unavailable: true, email };
  }
}
