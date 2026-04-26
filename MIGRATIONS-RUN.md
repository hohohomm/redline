# Migrations Run — Pre-ship Hardening

**Purpose**: Committed migrations not yet applied to production Supabase. Paste each SQL block into Supabase SQL editor manually (per CLAUDE.md: migrations run by hand, never auto-applied).

---

## 0009_settings_business.sql

**File**: `supabase/migrations/0009_settings_business.sql`

**Purpose**: Add business identity + invoice default fields to user_settings table.

```sql
-- Extend user_settings with business identity + invoice default fields.
-- Run manually in the Supabase SQL editor.

alter table user_settings
  add column if not exists business_name text,
  add column if not exists business_email text,
  add column if not exists abn text,
  add column if not exists default_payment_terms text not null default 'Net 14',
  add column if not exists reminder_tone text not null default 'Friendly'
    check (reminder_tone in ('Friendly', 'Direct', 'Firm'));
```

**Verification**: Run in SQL editor after pasting migration.

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name='user_settings' 
AND column_name IN ('business_name','business_email','abn','default_payment_terms','reminder_tone');
```

Expect 5 rows (one per column).

---

## 0010_referrals.sql

**File**: `supabase/migrations/0010_referrals.sql`

**Purpose**: Add referral tracking (referral_code column, trigger, SECURITY DEFINER function for counting).

```sql
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
```

**Verification**: Run in SQL editor after pasting migration.

```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('my_referral_code','ensure_referral_code');
```

Expect 2 rows (one per function). Note: `my_referral_count` appears as `my_referral_count`, `ensure_referral_code` as trigger function.
