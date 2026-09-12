-- ============================================================
-- Goyenda — reorder cases in one round trip
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
-- ============================================================

-- Sets position = 1..n in the order the ids are given. Ids not in the
-- array keep their current position. Runs as the caller (security invoker)
-- so the admin's RLS update policy is what authorises it; anon has no
-- update policy and gets nothing.
create or replace function public.reorder_cases(ids uuid[])
returns void
language sql
security invoker
set search_path = public
as $$
  update public.cases c
     set position = o.pos
    from unnest(ids) with ordinality as o(id, pos)
   where c.id = o.id;
$$;

revoke all on function public.reorder_cases(uuid[]) from public;
grant execute on function public.reorder_cases(uuid[]) to authenticated;
