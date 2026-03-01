-- ============================================
-- ContentBlast Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text default 'starter' check (plan in ('starter', 'growth', 'scale')),
  blasts_used integer default 0,
  blasts_limit integer default 20,
  stripe_customer_id text,
  stripe_subscription_id text,
  brand_voice text,
  created_at timestamp with time zone default now()
);

-- 2. Blasts table
create table public.blasts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  original_content text,
  platforms text[] default '{}',
  tone text default 'Professional',
  results jsonb default '[]',
  created_at timestamp with time zone default now()
);

-- 3. Row Level Security
alter table public.profiles enable row level security;
alter table public.blasts enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Blasts: users can only read/insert their own
create policy "Users can view own blasts"
  on public.blasts for select
  using (auth.uid() = user_id);

create policy "Users can insert own blasts"
  on public.blasts for insert
  with check (auth.uid() = user_id);

-- 4. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Indexes for performance
create index idx_blasts_user_id on public.blasts(user_id);
create index idx_blasts_created_at on public.blasts(created_at desc);
create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
