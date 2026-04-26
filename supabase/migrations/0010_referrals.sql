-- Referral tracking.
-- - Each user gets a unique referral_code on first settings upsert.
-- - referred_by stores the referral_code of whoever brought them in.
-- Run manually in the Supabase SQL editor.

alter table user_settings
  add column if not exists referral_code text unique,
  add column if not exists referred_by text;

-- Generate an 8-char alphanumeric code (lowercase) using pgcrypto's gen_random_bytes.
-- Creates a function that is idempotent per-row: only generates when NULL.
create or replace function ensure_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or length(new.referral_code) = 0 then
    -- base36-ish: encode 6 random bytes as hex, truncate to 8 lowercase chars.
    new.referral_code := substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
  end if;
  return new;
end;
$$;

drop trigger if exists user_settings_referral_code on user_settings;

create trigger user_settings_referral_code
  before insert on user_settings
  for each row
  execute function ensure_referral_code();

-- Backfill existing rows.
update user_settings
set referral_code = substr(encode(gen_random_bytes(6), 'hex'), 1, 8)
where referral_code is null;

-- SECURITY DEFINER function so a user can count their own referrals
-- without opening SELECT policy on other users' rows.
create or replace function my_referral_count()
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
  from user_settings
  where user_id = auth.uid();

  if my_code is null then
    return 0;
  end if;

  select count(*) into n
  from user_settings
  where referred_by = my_code;

  return coalesce(n, 0);
end;
$$;

grant execute on function my_referral_count() to authenticated;
