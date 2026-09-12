-- ============================================================
-- Goyenda — per-case editorial copy
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- Everything here is optional text. When a column is null/empty the site
-- falls back to the rank-based default, so existing rows need no backfill.
-- ============================================================

alter table public.cases
  -- "How to buy" — shown in the buy panel and the mobile info block.
  add column if not exists purchase_info text,
  -- "How and when the solution arrives" — same places.
  add column if not exists delivery_info text,
  -- Per-case manifest for "What's in the file". JSON array of
  -- { "label": string, "count"?: number, "detail": string }.
  -- Empty array → rank template.
  add column if not exists contents jsonb not null default '[]'::jsonb,
  -- "Best with 2–4 people", "Solo-friendly", etc.
  add column if not exists player_note text,
  -- Themes / content warning, e.g. "Contains references to poisoning and
  -- domestic violence. Suitable for 16+."
  add column if not exists content_note text;
