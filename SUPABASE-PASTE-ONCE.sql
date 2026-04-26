-- =============================================================================
-- REDLINE — PASTE-ONCE MIGRATIONS + VERIFY
-- =============================================================================
-- Paste this whole file into Supabase SQL Editor → Run.
-- Idempotent: safe to re-run. "IF NOT EXISTS" + "OR REPLACE" everywhere.
-- Last step runs all verification queries; check the results pane.
-- =============================================================================


-- ----------------------------------------------------------------------------
-- MIGRATION 0009 — business identity + invoice defaults on user_settings
-- ----------------------------------------------------------------------------
alter table public.user_settings
  add column if not exists business_name text,
  add column if not exists business_email text,
  add column if not exists abn text,
  add column if not exists default_payment_terms text not null default 'Net 14',
  add column if not exists reminder_tone text not null default 'Friendly';

-- Add the check constraint only if it isn't already there.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_settings_reminder_tone_check'
  ) then
    alter table public.user_settings
      add constraint user_settings_reminder_tone_check
      check (reminder_tone in ('Friendly', 'Direct', 'Firm'));
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- MIGRATION 0010 — referral tracking
-- ----------------------------------------------------------------------------
alter table public.user_settings
  add column if not exists referral_code text unique,
  add column if not exists referred_by text;

-- Generate an 8-char code from 6 random bytes. Idempotent per-row.
create or replace function public.ensure_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or length(new.referral_code) = 0 then
    new.referral_code := substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
  end if;
  return new;
end;
$$;

drop trigger if exists user_settings_referral_code on public.user_settings;

create trigger user_settings_referral_code
  before insert on public.user_settings
  for each row
  execute function public.ensure_referral_code();

-- Backfill existing rows that don't yet have a code.
update public.user_settings
set referral_code = substr(encode(gen_random_bytes(6), 'hex'), 1, 8)
where referral_code is null;

-- SECURITY DEFINER fn: user counts their own referrals without reading others.
create or replace function public.my_referral_count()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  my_code text;
  n int;
begin
  select referral_code into my_code
  from public.user_settings
  where user_id = auth.uid();

  if my_code is null then
    return 0;
  end if;

  select count(*) into n
  from public.user_settings
  where referred_by = my_code;

  return coalesce(n, 0);
end;
$$;

grant execute on function public.my_referral_count() to authenticated;


-- ----------------------------------------------------------------------------
-- VERIFY — every row below should return EXACTLY the expected value
-- ----------------------------------------------------------------------------
with
  v_0009_columns as (
    select count(*) as n
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'user_settings'
      and column_name  in (
        'business_name','business_email','abn',
        'default_payment_terms','reminder_tone'
      )
  ),
  v_0009_check as (
    select count(*) as n
    from pg_constraint
    where conname = 'user_settings_reminder_tone_check'
  ),
  v_0010_columns as (
    select count(*) as n
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'user_settings'
      and column_name  in ('referral_code','referred_by')
  ),
  v_0010_fns as (
    select count(*) as n
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public'
      and p.proname in ('ensure_referral_code','my_referral_count')
  ),
  v_0010_trigger as (
    select count(*) as n
    from pg_trigger
    where tgname = 'user_settings_referral_code'
  ),
  v_backfill_gap as (
    select count(*) as n
    from public.user_settings
    where referral_code is null
  )
select
  '0009 columns'                 as check_name, n as actual, 5 as expected, (n = 5) as pass from v_0009_columns
union all select '0009 tone check', n, 1, (n = 1)              from v_0009_check
union all select '0010 columns',    n, 2, (n = 2)              from v_0010_columns
union all select '0010 functions',  n, 2, (n = 2)              from v_0010_fns
union all select '0010 trigger',    n, 1, (n = 1)              from v_0010_trigger
union all select 'referral backfill (rows still NULL)', n, 0, (n = 0) from v_backfill_gap;
