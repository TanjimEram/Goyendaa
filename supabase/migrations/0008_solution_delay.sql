-- ============================================================
-- Goyenda — per-case solution delay
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run. Run it BEFORE deploying the code that reads the column,
-- or every case query fails.
--
-- Hours between approval (the case file going out) and the solution email.
-- NULL = the rank's default (RANKS in src/lib/cases.ts). Fractions allowed
-- (0.5 = 30 min); the cron ticks every 10 minutes, so that is the real
-- resolution. Mirrors HOUR_LIMITS.solution_delay_hours in src/lib/cases.ts.
-- ============================================================

alter table public.cases
  add column if not exists solution_delay_hours numeric(6,2);

alter table public.cases drop constraint if exists cases_solution_delay_hours_range;
alter table public.cases
  add constraint cases_solution_delay_hours_range
  check (solution_delay_hours is null or solution_delay_hours between 0 and 168);
