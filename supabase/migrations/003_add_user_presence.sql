alter table public.users add column if not exists last_seen_at timestamptz;
create index if not exists users_last_seen_at_idx on public.users (last_seen_at);

alter table public.users add column if not exists created_at timestamptz default now();

alter table public.users add column if not exists last_device text;
