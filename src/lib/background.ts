import "server-only";

import { after } from "next/server";

/**
 * Runs `work` after the response without making the caller wait:
 * Cloudflare's ctx.waitUntil on Workers, Next's after() elsewhere (next dev).
 * Rejections are swallowed here; log inside `work` if it matters.
 */
export async function inBackground(work: Promise<unknown>): Promise<void> {
  const safe = work.catch(() => undefined);
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { ctx } = await getCloudflareContext({ async: true });
    if (ctx?.waitUntil) {
      ctx.waitUntil(safe);
      return;
    }
  } catch {
    // Not on Workers.
  }
  after(safe);
}
