-- ============================================================
-- Goyenda — order guards
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- One bKash payment pays for one order. The checkout already refuses a
-- TrxID that's on another pending/paid order; this index makes the
-- database refuse it too, so two simultaneous submits can't both win.
-- Rejected orders are exempt (a buyer may retry after a typo was rejected).
-- ============================================================

create unique index if not exists orders_trxid_once_idx
  on public.orders (submitted_trxid)
  where status in ('pending', 'paid');
