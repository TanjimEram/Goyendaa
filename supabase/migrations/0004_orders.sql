-- ============================================================
-- Goyenda — orders (manual bKash "Send Money" + TrxID verification)
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- Lifecycle:
--   started   row reserved the moment the checkout page opens, so the
--             order code exists before the buyer sends money
--   pending   buyer submitted name/email/TrxID; awaiting admin cross-check
--   paid      admin approved; download unlocked; solution_send_at set
--   rejected  admin rejected with a reason
-- ============================================================

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),

  -- Human code the buyer types into bKash's reference and back into the form.
  order_code        text not null unique
                    check (order_code ~ '^GYD-[0-9]{4,6}$'),

  -- Unguessable handle for the buyer's own status/download page.
  access_token      uuid not null unique default gen_random_uuid(),

  -- Idempotency for the "started" reservation: one open reservation per
  -- browser session per case (see partial unique index below).
  checkout_session  uuid,

  case_id           uuid not null references public.cases (id) on delete restrict,

  buyer_name        text,
  buyer_email       text,
  amount            integer not null check (amount >= 0),          -- BDT snapshot
  submitted_trxid   text check (submitted_trxid ~ '^[A-Z0-9]{6,20}$'),

  status            text not null default 'started'
                    check (status in ('started', 'pending', 'paid', 'rejected')),
  rejection_reason  text,

  -- Delivery clock: set at APPROVAL time from the case's rank delay.
  solution_send_at  timestamptz,
  solution_sent     boolean not null default false,

  created_at        timestamptz not null default now(),
  submitted_at      timestamptz,
  approved_at       timestamptz,
  rejected_at       timestamptz,

  -- Guards: a pending/paid order must carry buyer details.
  constraint orders_pending_has_details check (
    status = 'started'
    or (buyer_name is not null and buyer_email is not null and submitted_trxid is not null)
  )
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_case_idx on public.orders (case_id);
create index if not exists orders_solution_due_idx
  on public.orders (solution_send_at) where status = 'paid' and solution_sent = false;

-- One open reservation per session+case; submitted orders are exempt so a
-- buyer can legitimately buy the same case twice.
create unique index if not exists orders_started_session_case_idx
  on public.orders (checkout_session, case_id) where status = 'started';

-- ------------------------------------------------------------
-- RLS
--   anon          — nothing. The public site touches orders only through
--                   server code holding the service-role key.
--   authenticated — the admin: read everything, update (approve/reject).
--   service_role  — bypasses RLS by definition.
-- ------------------------------------------------------------
alter table public.orders enable row level security;

drop policy if exists "admin reads orders" on public.orders;
create policy "admin reads orders"
  on public.orders for select to authenticated using (true);

drop policy if exists "admin updates orders" on public.orders;
create policy "admin updates orders"
  on public.orders for update to authenticated using (true) with check (true);
