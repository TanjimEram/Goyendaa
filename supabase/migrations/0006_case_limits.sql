-- ============================================================
-- Goyenda — numeric limits on cases
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- Mirrors CASE_LIMITS in src/lib/cases.ts, which the admin form's
-- min/max and the saveCase server action also use. Change all three
-- together. The constraint names are matched by dbErrorState() in
-- src/app/admin/(dashboard)/cases/actions.ts to pin the error to a field.
--
--   price          0 – 100000 BDT
--   solve_minutes  15 – 1440 (15 min to a full day)
--   page_count     1 – 1000
--
-- Replaces the open-ended checks from 0001 (price >= 0, solve_minutes > 0,
-- page_count >= 0). Every existing row was inside the new ranges on
-- 2026-09-29, so this applies cleanly.
-- ============================================================

alter table public.cases drop constraint if exists cases_price_check;
alter table public.cases drop constraint if exists cases_solve_minutes_check;
alter table public.cases drop constraint if exists cases_page_count_check;

alter table public.cases drop constraint if exists cases_price_range;
alter table public.cases drop constraint if exists cases_solve_minutes_range;
alter table public.cases drop constraint if exists cases_page_count_range;

alter table public.cases
  add constraint cases_price_range         check (price between 0 and 100000),
  add constraint cases_solve_minutes_range check (solve_minutes between 15 and 1440),
  add constraint cases_page_count_range    check (page_count between 1 and 1000);

-- 0001 defaulted page_count to 0, which the new range rejects.
alter table public.cases alter column page_count set default 20;
