alter table reminder_logs enable row level security;

create policy "own_reminder_logs" on reminder_logs
  for all
  using (
    exists (
      select 1
      from invoices
      where invoices.id = reminder_logs.invoice_id
        and invoices.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from invoices
      where invoices.id = reminder_logs.invoice_id
        and invoices.user_id = auth.uid()
    )
  );
