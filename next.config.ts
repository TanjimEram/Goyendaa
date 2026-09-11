import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // OpenNext consumes Next's standalone output. Normally it sets this itself
  // by driving `next build`; we run `next build` first (so Cloudflare's
  // default `npm run build` works) and hand OpenNext the result with
  // --skipNextBuild, which means this must be explicit.
  output: "standalone",
};

export default nextConfig;

// Lets `next dev` reach Cloudflare bindings (KV, R2, secrets …) through
// getCloudflareContext() once we have any. No-op in production builds.
initOpenNextCloudflareForDev();
