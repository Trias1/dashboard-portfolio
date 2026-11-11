-- 007: one about / hero / contact_info row per user.
-- The app updates the row if there is one and inserts otherwise; two saves at the same moment (a
-- double-click on Save) could both insert. With these indexes the second insert fails and the app
-- retries it as an update (src/lib/supabase/owner-row.ts).
--
-- Check first: this must return no rows. If it does, delete the extra rows for those owners (keep the
-- newest) before creating the indexes, or the create statements below will fail.
--
--   select 'about' as t, owner_id, count(*) from public.about group by owner_id having count(*) > 1
--   union all
--   select 'hero', owner_id, count(*) from public.hero group by owner_id having count(*) > 1
--   union all
--   select 'contact_info', owner_id, count(*) from public.contact_info group by owner_id having count(*) > 1;

create unique index if not exists about_owner_id_key on public.about (owner_id);
create unique index if not exists hero_owner_id_key on public.hero (owner_id);
create unique index if not exists contact_info_owner_id_key on public.contact_info (owner_id);
