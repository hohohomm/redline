create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  late_fee_type text not null default 'percent' check (late_fee_type in ('percent', 'flat')),
  late_fee_value numeric(10,2) not null default 5,
  late_fee_after_days int not null default 21,
  stripe_account_id text
);

alter table user_settings enable row level security;

create policy "own" on user_settings
  for all
  using (auth.uid() = user_id);
