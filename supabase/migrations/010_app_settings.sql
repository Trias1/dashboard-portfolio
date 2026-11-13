-- 010: switches a superadmin can flip without a redeploy (sign-ups open, AI on, an announcement banner,
-- extra reserved slugs). One row per key; the app falls back to its defaults when a key is missing.
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by bigint references public.users(id) on delete set null
);

-- Only the server (service role) reads or writes this table.
alter table public.app_settings enable row level security;
