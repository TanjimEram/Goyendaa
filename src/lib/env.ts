import "server-only";

/**
 * Server-side secrets and settings.
 *
 * Where values come from:
 *   production   Cloudflare Worker "Variables and Secrets" → OpenNext copies
 *                them into process.env at request start.
 *   next dev     `.env.local` lands in process.env; `.dev.vars` is loaded by
 *                wrangler's platform proxy and reached via getCloudflareContext.
 * This helper checks both so either file works locally.
 */
export async function serverEnv(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const v = (env as Record<string, unknown>)[name];
    return typeof v === "string" && v ? v : undefined;
  } catch {
    return undefined;
  }
}

export async function requireEnv(name: string): Promise<string> {
  const v = await serverEnv(name);
  if (!v) throw new Error(`Missing environment variable ${name} (see .env.example / .dev.vars.example)`);
  return v;
}

/**
 * Everything the checkout + admin order flow needs, resolved once.
 * Email provider keys are NOT here — `sendMail` picks its own provider.
 */
export async function orderEnv() {
  const [bkashNumber, adminEmail, serviceRoleKey] = await Promise.all([
    requireEnv("BKASH_NUMBER"),
    requireEnv("ADMIN_EMAIL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  ]);
  return { bkashNumber, adminEmail, serviceRoleKey };
}
