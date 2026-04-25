create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text,
  body text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create index contact_messages_status_idx on contact_messages (status);
create index contact_messages_created_idx on contact_messages (created_at desc);

alter table contact_messages enable row level security;

create policy "anyone can submit" on contact_messages
  for insert
  with check (true);
