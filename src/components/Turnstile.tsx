"use client";

import { useEffect, useRef } from "react";

/** Public by design; a build variable like the Supabase ones. Unset = off. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile, inside a <form>: it adds a hidden
 * `cf-turnstile-response` input that the server action verifies.
 * "interaction-only" keeps it invisible unless Cloudflare wants a click.
 *
 * Tokens are single-use, so pass the action state as `resetKey`: every
 * result (an error included) fetches a fresh token for the next submit.
 * The script is injected from here rather than a <script> tag so it works
 * after client-side navigation; the CSP's 'strict-dynamic' trusts it
 * because our own (nonced) bundle created it.
 */
export function Turnstile({ resetKey }: { resetKey?: unknown }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const render = () => {
      if (!box.current || !window.turnstile || widget.current) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        appearance: "interaction-only",
      });
    };
    if (window.turnstile) render();
    else {
      let s = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (!s) {
        s = document.createElement("script");
        s.src = SCRIPT;
        s.async = true;
        s.dataset.turnstile = "";
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }
    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (widget.current) window.turnstile?.reset(widget.current);
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} />;
}
