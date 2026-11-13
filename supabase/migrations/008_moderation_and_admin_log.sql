-- 008: portfolio takedown by a superadmin, and a log of admin actions.

-- A taken-down portfolio is hidden from everyone but its owner and superadmins, and its owner can't
-- publish it again until a superadmin restores it. Separate from is_published so the owner's own
-- publish state comes back unchanged on restore.
alter table public.portfolios add column if not exists taken_down_at timestamptz;
alter table public.portfolios add column if not exists takedown_reason text;

-- Who did what to which account. target_user_id has no foreign key and target_label keeps the email
-- or slug as it was, so entries stay readable after the account is deleted.
create table if not exists public.admin_actions (
  id bigint generated always as identity primary key,
  actor_id bigint references public.users(id) on delete set null,
  action text not null,
  target_user_id bigint,
  target_label text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);

-- Only the server (service role) reads or writes this table.
alter table public.admin_actions enable row level security;
