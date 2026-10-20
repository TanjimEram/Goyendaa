-- ============================================================
-- Goyenda — admin login throttle
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- One row per FAILED admin sign-in. src/lib/bot-guard.ts refuses a login
-- after 5 failures per IP or 10 per account in 15 minutes. The email is
-- stored as a SHA-256 hash, never as typed. The cron deletes rows older
-- than a day. Service role only: RLS on, no policies, no grants.
-- ============================================================

create table if not exists public.login_attempts (
  id         bigint generated always as identity primary key,
  ip         text not null,
  email_hash text not null,
  at         timestamptz not null default now()
);

create index if not exists login_attempts_ip_at_idx on public.login_attempts (ip, at);
create index if not exists login_attempts_email_at_idx on public.login_attempts (email_hash, at);

alter table public.login_attempts enable row level security;
revoke all on public.login_attempts from anon, authenticated;
