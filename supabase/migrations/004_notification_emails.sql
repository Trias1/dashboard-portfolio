-- Where contact-form messages are delivered, when the owner wants an address other than their login email.
-- Kept out of contact_info on purpose: contact_info is public, this address is not, and it only counts
-- once the owner has clicked the confirmation link sent to it.
create table if not exists public.notification_emails (
  owner_id bigint primary key references public.users(id) on delete cascade,
  email text not null,
  verified_at timestamptz,
  token_hash text,
  token_expires timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists notification_emails_token_hash_idx on public.notification_emails (token_hash);

-- Only the server (service role) reads or writes this table.
alter table public.notification_emails enable row level security;
