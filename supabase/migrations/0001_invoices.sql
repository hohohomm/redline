create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  issue_date date not null default current_date,
  due_date date not null,
  subtotal numeric(12,2) not null,
  late_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'void')),
  last_reminder_stage int not null default 0,
  created_at timestamptz default now()
);

create table line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null,
  unit_price numeric(12,2) not null,
  amount numeric(12,2) not null
);

alter table invoices enable row level security;
alter table line_items enable row level security;

create policy "own" on invoices
  for all
  using (auth.uid() = user_id);

create policy "own_li" on line_items
  for all
  using (
    exists (
      select 1
      from invoices
      where invoices.id = line_items.invoice_id
        and invoices.user_id = auth.uid()
    )
  );
