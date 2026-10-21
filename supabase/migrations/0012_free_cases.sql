-- ============================================================
-- Goyenda — free cases, leads, per-IP rate limits, UTM on orders
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run. Run BEFORE deploying the code that reads these columns
-- (the public catalogue selects cases.is_free).
-- ============================================================

-- ── Free cases ───────────────────────────────────────────────────────
alter table public.cases
  add column if not exists is_free boolean not null default false,
  add column if not exists answer_md text,            -- the answer page, Markdown
  add column if not exists answer_image_path text,    -- private bucket path
  add column if not exists answer_unlock_at timestamptz;  -- null = unlocked

alter table public.cases drop constraint if exists cases_free_is_zero;
alter table public.cases
  add constraint cases_free_is_zero check (not is_free or price = 0);

-- The public key reads is_free (badges, "Play free"); the answer columns
-- stay server-only. Add to PUBLIC_COLUMNS in src/lib/cases-data.ts too.
grant select (is_free) on public.cases to anon;

-- ── Leads (free-case email capture) ──────────────────────────────────
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text,
  case_id       uuid references public.cases(id) on delete set null,
  case_slug     text not null,
  consent       boolean not null default false,   -- "send me new cases…"
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  token         uuid not null unique default gen_random_uuid(),  -- links + cookie
  downloads     integer not null default 0,
  answer_views  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (email, case_slug)
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;
revoke all on public.leads from anon;
drop policy if exists "admin reads leads" on public.leads;
create policy "admin reads leads" on public.leads for select to authenticated using (true);

-- Same email + same case = update, never a duplicate. Keeps the first
-- UTM touch and the original token; consent follows the latest answer.
create or replace function public.upsert_lead(
  p_email text, p_name text, p_case_id uuid, p_case_slug text, p_consent boolean,
  p_utm_source text, p_utm_medium text, p_utm_campaign text
) returns table (token uuid, created boolean)
language sql
security invoker
set search_path = public
as $$
  insert into public.leads as l (email, name, case_id, case_slug, consent, utm_source, utm_medium, utm_campaign)
  values (lower(trim(p_email)), nullif(trim(p_name), ''), p_case_id, p_case_slug, p_consent,
          p_utm_source, p_utm_medium, p_utm_campaign)
  on conflict (email, case_slug) do update set
    name         = coalesce(excluded.name, l.name),
    case_id      = excluded.case_id,
    consent      = excluded.consent,
    utm_source   = coalesce(l.utm_source, excluded.utm_source),
    utm_medium   = coalesce(l.utm_medium, excluded.utm_medium),
    utm_campaign = coalesce(l.utm_campaign, excluded.utm_campaign),
    updated_at   = now()
  returning l.token, (l.xmax = 0) as created;
$$;

-- Download / answer-view counters, by token.
create or replace function public.lead_hit(p_token uuid, p_kind text)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.leads set
    downloads    = downloads    + (p_kind = 'download')::int,
    answer_views = answer_views + (p_kind = 'answer')::int
  where token = p_token;
$$;

revoke execute on function public.upsert_lead(text, text, uuid, text, boolean, text, text, text) from public, anon, authenticated;
revoke execute on function public.lead_hit(uuid, text) from public, anon, authenticated;

-- ── Per-IP rate limits for public forms ──────────────────────────────
create table if not exists public.rate_hits (
  id       bigint generated always as identity primary key,
  kind     text not null,
  ip_hash  text not null,
  at       timestamptz not null default now()
);
create index if not exists rate_hits_kind_ip_at_idx on public.rate_hits (kind, ip_hash, at);
alter table public.rate_hits enable row level security;
revoke all on public.rate_hits from anon, authenticated;

-- ── UTM on paid orders (which channel actually sells) ────────────────
alter table public.orders
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text;
