-- 009: visitor reports of a portfolio, and a usage read-out for the superadmin health panel.

-- "Report this portfolio" from the public page. No raw IP is kept: reporter_hash is an HMAC of the IP,
-- only used to spot one person filing many reports.
create table if not exists public.portfolio_reports (
  id bigint generated always as identity primary key,
  portfolio_id bigint not null references public.portfolios(id) on delete cascade,
  reason text not null,
  details text,
  reporter_hash text,
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  resolved_at timestamptz,
  resolved_by bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists portfolio_reports_status_idx on public.portfolio_reports (status, created_at desc);

-- Only the server (service role) reads or writes this table.
alter table public.portfolio_reports enable row level security;

-- Database and storage size for the free-tier meters. Read-only; callable by the service role only.
create or replace function public.admin_usage()
returns json
language sql
stable
security definer
set search_path = public, storage
as $$
  select json_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0),
    'storage_objects', (select count(*) from storage.objects)
  );
$$;
revoke all on function public.admin_usage() from public, anon, authenticated;
grant execute on function public.admin_usage() to service_role;
