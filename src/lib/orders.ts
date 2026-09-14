/**
 * Order display helpers safe for any component. Data access lives in
 * `orders-data.ts` (server-only).
 */

const DHAKA = "Asia/Dhaka";

/** "9:42 PM" in Bangladesh time. */
export function formatTimeBD(iso: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: DHAKA,
  }).format(new Date(iso));
}

/** "12 Sep 2026, 6:42 PM" in Bangladesh time. */
export function formatDateTimeBD(iso: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DHAKA,
  }).format(new Date(iso));
}
