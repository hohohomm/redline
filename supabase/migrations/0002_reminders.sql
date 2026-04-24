create table reminder_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  stage int not null,
  sent_at timestamptz not null default now()
);
