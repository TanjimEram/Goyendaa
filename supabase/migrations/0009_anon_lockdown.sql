-- ============================================================
-- Goyenda — narrow what the public (anon) key can touch
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- Found in the 2026-10-20 security review, probing with the anon key:
--   1. anon could read cases.case_pdf_path / solution_pdf_path. The files
--      stayed private, but the object names leaked.
--   2. anon could EXECUTE reorder_cases (Supabase's default privileges
--      grant it; `revoke … from public` doesn't undo that). RLS still
--      blocked the update — this removes the door, not just the lock.
--   3. anon could list every object in case-media, including images of
--      unpublished cases. Public-bucket downloads don't need a SELECT
--      policy, so only the listing goes away.
-- ============================================================

-- 1. Column-level: anon reads exactly PUBLIC_COLUMNS in src/lib/cases-data.ts.
--    Add a column here when you add it there, or public pages 401.
revoke select on public.cases from anon;
grant select (
  id, case_number, slug, title, premise, description, price, difficulty_rank,
  position, published, featured, thumbnail_url, gallery_urls, tags,
  solve_minutes, solution_delay_hours, page_count, purchase_info,
  delivery_info, contents, player_note, content_note
) on public.cases to anon;

-- Nothing public writes; RLS already refuses, this refuses earlier.
revoke insert, update, delete, truncate on public.cases from anon;
revoke all on public.orders from anon;

-- 2. Only the signed-in admin may call the reorder RPC.
revoke execute on function public.reorder_cases(uuid[]) from anon;

-- 3. Listing case-media is admin-only; public URLs keep working.
drop policy if exists "anyone reads case-media" on storage.objects;
drop policy if exists "admin reads case-media" on storage.objects;
create policy "admin reads case-media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'case-media');
