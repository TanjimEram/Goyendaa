import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Thumbnails and gallery images live in Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;

// Lets `next dev` reach Cloudflare bindings (KV, R2, secrets …) through
// getCloudflareContext() once we have any. No-op in production builds.
initOpenNextCloudflareForDev();
