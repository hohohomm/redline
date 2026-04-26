-- Extend user_settings with business identity + invoice default fields.
-- Run manually in the Supabase SQL editor.

alter table user_settings
  add column if not exists business_name text,
  add column if not exists business_email text,
  add column if not exists abn text,
  add column if not exists default_payment_terms text not null default 'Net 14',
  add column if not exists reminder_tone text not null default 'Friendly'
    check (reminder_tone in ('Friendly', 'Direct', 'Firm'));
