import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Lets `next dev` reach Cloudflare bindings (KV, R2, secrets …) through
// getCloudflareContext() once we have any. No-op in production builds.
initOpenNextCloudflareForDev();
