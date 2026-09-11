import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare Workers.
 *
 * No incremental cache is configured on purpose: every route is prerendered
 * at build time and nothing calls revalidate*, so an ISR store would be an
 * R2 bucket holding nothing. When a route needs ISR, switch to
 *   incrementalCache: r2IncrementalCache
 * (from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache")
 * and add the matching r2_buckets + services bindings in wrangler.jsonc.
 */
export default defineCloudflareConfig({});
