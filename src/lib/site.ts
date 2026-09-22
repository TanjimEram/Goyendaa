/**
 * Site-wide facts used in copy. One place to change them.
 */
export const SITE = {
  name: "Goyenda",
  /**
   * Canonical origin, used to make OG image / canonical URLs absolute.
   * Set NEXT_PUBLIC_SITE_URL (build-time) once a custom domain exists;
   * the Workers URL is the fallback so link previews work from day one.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://goyenda.goyenda.workers.dev",
  tagline: "Printable detective case files",
  /** Where buyers write. Also the reply-to on every transactional email. */
  contactEmail: "goyendaaa@gmail.com",
  /** Shown in the footer and on /contact. Same number buyers send money to. */
  contactPhone: "01972644744",
  /** WhatsApp uses the international form, no spaces or +. */
  contactPhoneIntl: "8801972644744",
  /** When a human actually answers the phone. */
  contactHours: "10 am \u2013 10 pm, Dhaka time",
  /** Shown on the legal pages. Bump when the wording changes. */
  legalUpdated: "14 September 2026",
  /** The entity named in the terms. Sole trader until a licence exists. */
  operator: "Goyenda, an individual seller based in Dhaka, Bangladesh",
  /** Days the download stays available after approval. Enforced by the
   *  download route and stated on terms, FAQ and emails. */
  downloadWindowDays: 7,
  /** Plain-language promise for how fast a payment is checked. Shown on the
   *  checkout page, the pending page and the buyer's receipt email. */
  confirmationWindow: "usually within a few hours, between 9 am and 11 pm Dhaka time",
} as const;
