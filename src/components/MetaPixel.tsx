"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SITE } from "@/lib/site";

/**
 * Meta Pixel. Loaded from the root layout; fires PageView per page.
 *
 * Never on /admin, and never on /orders/*: those URLs carry the buyer's
 * private access token, and every Pixel event sends the page URL to Meta.
 * Purchase is NOT a browser event — the server sends it via the
 * Conversions API when an order is approved (src/lib/meta-capi.ts).
 *
 * The script is injected from this bundle rather than an inline snippet,
 * so the per-request CSP ('strict-dynamic') trusts it without a nonce.
 */

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};
type PixelWindow = Window & { fbq?: Fbq; _fbq?: Fbq };

// Pages whose URL can carry a token (order page, answer ?t=, unsubscribe).
const PRIVATE = /^\/(admin|orders|unsubscribe|case)(\/|$)|^\/cases\/[^/]+\/(answer|download)/;

/** Defines the queueing stub, loads fbevents.js and inits — once. */
function ensurePixel(): Fbq | null {
  const w = window as PixelWindow;
  if (PRIVATE.test(w.location.pathname)) return null;
  if (w.fbq) return w.fbq;

  // Meta's standard base code, as TypeScript.
  const n = function (this: unknown) {
    // eslint-disable-next-line prefer-rest-params
    if (n.callMethod) n.callMethod(...(arguments as unknown as unknown[]));
    // eslint-disable-next-line prefer-rest-params
    else n.queue.push(arguments);
  } as unknown as Fbq;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  // We fire PageView ourselves per route; stop fbevents auto-firing on
  // history changes (it would also fire on a client nav into /orders).
  n.disablePushState = true;
  w.fbq = n;
  w._fbq = n;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);

  // No automatic button-click / page-metadata events: only what we send.
  n("set", "autoConfig", false, SITE.metaPixelId);
  n("init", SITE.metaPixelId);
  return n;
}

/** In the root layout. PageView on every public page, including client
 *  navigations; nothing at all on private paths. */
export function MetaPixel() {
  const pathname = usePathname();
  useEffect(() => {
    ensurePixel()?.("track", "PageView");
  }, [pathname]);
  return null;
}

export interface PixelProductParams {
  content_ids: string[];
  content_name: string;
  content_type: "product";
  value: number;
  currency: "BDT";
}

/**
 * Fires one standard event when it mounts. `oncePerSession` dedupes by key
 * in sessionStorage, so a refresh or a back-and-forth doesn't count twice.
 */
export function PixelEvent({
  event,
  params,
  oncePerSession,
}: {
  event: "ViewContent" | "InitiateCheckout";
  params: PixelProductParams;
  oncePerSession?: string;
}) {
  const key = JSON.stringify([event, params, oncePerSession]);
  useEffect(() => {
    const p = JSON.parse(key)[1] as PixelProductParams;
    if (oncePerSession) {
      const k = `gyd_px:${oncePerSession}`;
      try {
        if (sessionStorage.getItem(k)) return;
        sessionStorage.setItem(k, "1");
      } catch {
        // Storage blocked: fire anyway rather than never.
      }
    }
    ensurePixel()?.("track", event, p);
  }, [key, event, oncePerSession]);
  return null;
}
