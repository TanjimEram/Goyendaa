/**
 * Site-wide facts used in copy. One place to change them.
 *
 * TODO(owner): replace the contact email before launch. It's referenced on
 * /contact, /faq, the legal pages and the success page.
 */
export const SITE = {
  name: "Goyenda",
  /**
   * Canonical origin, used to make OG image / canonical URLs absolute.
   * Set NEXT_PUBLIC_SITE_URL (build-time) once a custom domain exists;
   * the Workers URL is the fallback so link previews work from day one.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://goyendaa.eramtanjim.workers.dev",
  tagline: "Printable detective case files",
  /** Where buyers write. Also the reply-to for transactional email later. */
  contactEmail: "hello@goyenda.com",
  /** Shown on the legal pages. Bump when the wording changes. */
  legalUpdated: "14 September 2026",
  /** The entity named in the terms. Sole trader until a licence exists. */
  operator: "Goyenda, an individual seller based in Dhaka, Bangladesh",
  /** Hours the download link stays valid after purchase. Mirrors the
   *  success-page copy; the real signed-URL TTL must match this. */
  downloadWindowDays: 7,
} as const;
