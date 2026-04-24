-- Kill switch table — service role only, no RLS policies.
create table system_flags (
  key text primary key,
  enabled boolean not null default true,
  note text,
  updated_at timestamptz not null default now()
);

alter table system_flags enable row level security;

insert into system_flags (key, enabled, note) values
  ('cron_reminders', true, 'Daily reminder escalation cron');

-- Generic events log — audit trail + analytics + error sink.
create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index events_created_idx on events (created_at desc);
create index events_kind_idx on events (kind);
create index events_user_idx on events (user_id);

alter table events enable row level security;

-- Stripe webhook idempotency + paid_at timestamp.
alter table invoices add column paid_at timestamptz;

create table stripe_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

alter table stripe_webhook_events enable row level security;
