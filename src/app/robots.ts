import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Keep crawlers out of the order pipeline: every visit to /checkout/*
 * reserves an order row, and order pages are private by token.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout/", "/orders/", "/admin/", "/api/"] },
    host: SITE.url,
  };
}
