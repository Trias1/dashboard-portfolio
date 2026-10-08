-- 005: revocable login sessions + an atomic rate limiter.

-- One row per refresh token. The refresh JWT carries the row id (jti) and its family id.
-- Refreshing revokes the row and creates the next one in the same family; presenting an
-- already-revoked token (outside a short grace window) revokes the whole family.
create table if not exists public.auth_sessions (
  id uuid primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  family_id uuid not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  replaced_by uuid,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists auth_sessions_user_idx on public.auth_sessions (user_id) where revoked_at is null;
create index if not exists auth_sessions_family_idx on public.auth_sessions (family_id);
alter table public.auth_sessions enable row level security;

-- Count-and-insert in one transaction under an advisory lock, so parallel requests
-- can't all slip under the limit (the old count-then-insert raced).
create or replace function public.rate_limit_hit(p_identifier text, p_type text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hits integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_type || ':' || p_identifier));
  select count(*) into hits
    from public.rate_limits
   where identifier = p_identifier
     and type = p_type
     and created_at >= now() - make_interval(secs => p_window_seconds);
  if hits >= p_max then
    return false;
  end if;
  insert into public.rate_limits (identifier, type, created_at) values (p_identifier, p_type, now());
  return true;
end;
$$;
revoke all on function public.rate_limit_hit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, text, integer, integer) to service_role;
