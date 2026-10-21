-- ============================================================
-- Goyenda — Meta Conversions API attribution on orders
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- Captured at checkout submit ONLY while the META_CAPI_TOKEN secret is set,
-- used once when the order is approved (the server-side Purchase event),
-- then cleared on approve or reject. src/lib/meta-capi.ts.
--   meta_fbp / meta_fbc   the Pixel's _fbp / _fbc cookies, when present
--   client_ip             the buyer's IP as Cloudflare saw it
--   client_user_agent     the buyer's browser user agent
-- Orders are service-role only (RLS on, anon revoked in 0009), so these
-- never reach the public key.
-- ============================================================

alter table public.orders
  add column if not exists meta_fbp text,
  add column if not exists meta_fbc text,
  add column if not exists client_ip text,
  add column if not exists client_user_agent text;
