-- ============================================================
-- Goyenda — solution delivery bookkeeping
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- 0004 already carries `solution_send_at` (stamped at approval) and
-- `solution_sent`. The cron job needs three more things: when it actually
-- went out, how many times we've tried, and why the last try failed —
-- without them a permanently undeliverable order would be retried forever.
-- ============================================================

alter table public.orders
  add column if not exists solution_sent_at  timestamptz,
  add column if not exists solution_attempts integer not null default 0,
  add column if not exists solution_error    text;

comment on column public.orders.solution_sent_at is
  'When the solution email was actually accepted by the mail provider.';
comment on column public.orders.solution_attempts is
  'Failed + successful send attempts. The cron skips rows at 5 so a bad address cannot loop forever.';
comment on column public.orders.solution_error is
  'Last send failure, for the admin to read. Cleared on success.';

-- The cron polls exactly this shape every few minutes; keep it cheap.
create index if not exists orders_solution_due_idx
  on public.orders (solution_send_at)
  where status = 'paid' and solution_sent = false;
