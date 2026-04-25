-- Extend user_settings with new onboarding fields.
-- Run manually in the Supabase SQL editor.

alter table user_settings
  add column if not exists currency text not null default 'AUD'
    check (length(currency) = 3),
  add column if not exists late_fee_type text default 'none'
    check (late_fee_type in ('none', 'percent', 'flat')),
  add column if not exists late_fee_value numeric(12,2) default 0,
  add column if not exists late_fee_after_days int default 7,
  add column if not exists owner_first_name text,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists onboarding_preset text
    check (onboarding_preset in ('decide_for_me', 'custom'));
