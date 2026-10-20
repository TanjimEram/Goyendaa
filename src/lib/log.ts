/**
 * Logging that keeps buyer data out of the Worker logs.
 *
 * Supabase errors carry a `details` field with the offending row's values
 * (a duplicate TrxID, a buyer's email), and email-provider errors echo the
 * recipient. Only code + message are logged, and both are redacted.
 */

const EMAIL = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+/g;
// bKash TrxIDs and similar: 8–20 upper-case letters AND digits mixed.
const TOKEN_LIKE = /\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{8,20}\b/g;

export function redact(text: string): string {
  return text.replace(EMAIL, "[email]").replace(TOKEN_LIKE, "[id]");
}

/** One line: `code message`, redacted. Never the raw object. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return redact(error.message);
  const e = (error ?? {}) as { code?: unknown; message?: unknown };
  const text = [e.code, e.message].filter((x) => typeof x === "string" && x).join(" ");
  return redact(text || "unknown error");
}

export function logError(tag: string, error: unknown): void {
  console.error(tag, describeError(error));
}
