/**
 * Payment seam.
 *
 * Goyenda will take money through a Bangladeshi aggregator that pays out to
 * a personal bKash/Nagad/Rocket number (UddoktaPay or BangoPay — undecided).
 * Everything the checkout page and its server action know about payments
 * goes through `PaymentProvider`, so swapping the aggregator later is a new
 * file under `providers/`, not a rewrite.
 *
 * No provider is wired yet: `placeholderProvider` reports `unavailable` and
 * the checkout page explains that payments aren't open.
 */

export type PaymentMethod = "bkash" | "nagad" | "card";

export interface PaymentMethodMeta {
  label: string;
  hint: string;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodMeta> = {
  bkash: { label: "bKash", hint: "Pay from your bKash wallet" },
  nagad: { label: "Nagad", hint: "Pay from your Nagad wallet" },
  card: { label: "Card", hint: "Visa, Mastercard, local bank cards" },
};

export const PAYMENT_METHOD_ORDER: PaymentMethod[] = ["bkash", "nagad", "card"];

export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return typeof v === "string" && v in PAYMENT_METHODS;
}

/** What the checkout collects before handing off to a provider. */
export interface CheckoutRequest {
  caseId: string;
  caseSlug: string;
  caseTitle: string;
  /** BDT, whole taka. */
  amount: number;
  /** Where the case PDF link and, later, the solution go. */
  email: string;
  method: PaymentMethod;
  /** Absolute origin, e.g. https://goyenda.com — for return URLs. */
  origin: string;
}

export type CheckoutResult =
  /** Send the buyer to the provider's hosted page. */
  | { status: "redirect"; url: string }
  /** No provider configured. Checkout shows the "not open yet" state. */
  | { status: "unavailable" }
  /** Provider rejected the request; message is safe to show. */
  | { status: "error"; message: string };

export interface PaymentProvider {
  /** Short id, used in logs and later in the orders table. */
  id: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
}

const placeholderProvider: PaymentProvider = {
  id: "placeholder",
  async createCheckout() {
    return { status: "unavailable" };
  },
};

/**
 * Picks the provider from PAYMENT_PROVIDER. Until a real one exists this
 * always returns the placeholder; the switch is here so the wiring is
 * obvious when the time comes.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    // case "uddoktapay": return uddoktaPayProvider;
    // case "bangopay":   return bangoPayProvider;
    default:
      return placeholderProvider;
  }
}
