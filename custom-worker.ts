/**
 * Worker entrypoint.
 *
 * OpenNext's generated worker only exports `fetch`, so Cloudflare cron
 * triggers have nothing to call. This wraps it: Next.js still serves every
 * request, and `scheduled` dispatches the delayed-solution job through the
 * same handler — meaning the job runs with the full Next runtime (Supabase
 * client, email module, env resolution) instead of a parallel stack.
 *
 * `.open-next/worker.js` only exists after `opennextjs-cloudflare build`,
 * which is why this file sits outside tsconfig's include list. Wrangler
 * bundles it at deploy time.
 *
 * @see https://opennext.js.org/cloudflare/howtos/custom-worker
 */
// @ts-expect-error — generated at build time by opennextjs-cloudflare
import { default as handler } from "./.open-next/worker.js";

const CRON_PATH = "/api/cron/solutions";
const CRON_HEADER = "x-goyenda-cron";

const worker = {
  fetch: handler.fetch,

  async scheduled(event: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    const secret = (env as Record<string, unknown>).CRON_SECRET;
    if (typeof secret !== "string" || !secret) {
      console.error("[cron] CRON_SECRET is not set on the Worker — skipping run");
      return;
    }

    // Host is irrelevant (the request never leaves the isolate) but must
    // parse as an absolute URL for the Next router.
    const request = new Request(`https://goyenda.internal${CRON_PATH}`, {
      method: "POST",
      headers: { [CRON_HEADER]: secret },
    });

    const work = (async () => {
      try {
        const res = await handler.fetch(request, env, ctx);
        const body = await res.text();
        console.log(`[cron] ${event.cron} → ${res.status} ${body.slice(0, 500)}`);
      } catch (error) {
        console.error("[cron] run threw", error);
      }
    })();

    ctx.waitUntil(work);
    await work;
  },
};

export default worker;

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
